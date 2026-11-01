const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../server");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("POST rejects an empty student name", async () => {
  const response = await fetch(`${baseUrl}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "   ", age: 12 })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: "Name is required." });
});

test("POST rejects an invalid age", async () => {
  const response = await fetch(`${baseUrl}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Sam", age: 12.5 })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Age must be a whole number between 0 and 120."
  });
});

test("POST /api/users rejects an invalid email", async () => {
  const response = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Sam", email: "not-an-email", age: 12 })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Enter a valid email address."
  });
});

test("POST /api/users rejects an invalid age", async () => {
  const response = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Sam", email: "sam@example.com", age: 12.5 })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Age must be a whole number between 0 and 120."
  });
});

test("PUT and DELETE reject invalid MongoDB IDs", async () => {
  const updateResponse = await fetch(`${baseUrl}/api/students/not-an-id`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Sam", age: 12 })
  });
  const deleteResponse = await fetch(`${baseUrl}/api/students/not-an-id`, {
    method: "DELETE"
  });

  assert.equal(updateResponse.status, 400);
  assert.equal(deleteResponse.status, 400);
  assert.deepEqual(await updateResponse.json(), { message: "Student ID is invalid." });
  assert.deepEqual(await deleteResponse.json(), { message: "Student ID is invalid." });
});

test("malformed JSON receives a clear client error", async () => {
  const response = await fetch(`${baseUrl}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{"
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: "Request body must contain valid JSON."
  });
});

test("unknown API paths return 404", async () => {
  const response = await fetch(`${baseUrl}/api/unknown`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: "Route not found." });
});
