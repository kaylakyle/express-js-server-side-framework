## all tasks are done inside server.js

## task 1
Express.js Setup in your terminal,
1. Step 1: Initialize Node.js project
npm init -y
2. Step 2: Install Express.js and required dependencies
npm install express body-parser uuid
3. Create a basic Express server
4. Step 4: Run the server
node server.js
or
npm install

If everything’s correct, you’ll see:
Server is running on http://localhost:3000

5. Then open your browser and visit:
 http://localhost:3000

 task 2 
 since my laptop is lagging and super slow am using the terminal to test my APIs 
1. Get all products 
Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
-Method GET `
-Headers @{ "x-api-key" = "mysecretkey" }


2. get product by id
Invoke-RestMethod -Uri "http://localhost:3000/api/products/1" `
-Method GET `
-Headers @{ "x-api-key" = "mysecretkey" }


3. cretae a product
Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
-Method POST `
-Headers @{ "x-api-key" = "mysecretkey"; "Content-Type" = "application/json" } `
-Body '{"name":"Tablet","description":"Android tablet with 10-inch display","price":400,"category":"electronics","inStock":true}'


4. update existing product 
Invoke-RestMethod -Uri "http://localhost:3000/api/products/1" `
-Method PUT `
-Headers @{ "x-api-key" = "mysecretkey"; "Content-Type" = "application/json" } `
-Body '{"price":1300,"inStock":false}'


5. delete existing product 
Invoke-RestMethod -Uri "http://localhost:3000/api/products/3" `
-Method DELETE `
-Headers @{ "x-api-key" = "mysecretkey" }


task 3 
1. Invoke-RestMethod -Uri http://localhost:3000/api/products -Method GET -Headers @{ "x-api-key" = "mysecretkey" }
you should see 
[2025-10-19T22:30:00.000Z] GET /api/products

2. correct api key should work 
Invoke-RestMethod -Uri http://localhost:3000/api/products -Method GET -Headers @{ "x-api-key" = "mysecretkey" }

wrong /missing api fail
Invoke-RestMethod -Uri http://localhost:3000/api/products -Method GET

3. test valdation
missing field fail
 Invoke-RestMethod -Uri http://localhost:3000/api/products -Method POST -Headers @{ "x-api-key" = "mysecretkey"; "Content-Type" = "application/json" } -Body '{ "name": "Tablet" }'

 coorect pass 
 Invoke-RestMethod -Uri http://localhost:3000/api/products -Method POST -Headers @{ "x-api-key" = "mysecretkey"; "Content-Type" = "application/json" } -Body '{ "name": "Tablet", "description": "Android tablet", "price": 400, "category": "electronics" }'


task 4
1. ❌ 2. Test NotFoundError

Try fetching a product that doesn’t exist:

Invoke-RestMethod -Uri "http://localhost:3000/api/products/9" `
-Method GET `
-Headers @{ "x-api-key" = "mysecretkey" }

 expected response
 {
  "error": true,
  "message": "Product not found"
}

2. ⚠️ 3. Test ValidationError

Try creating a product without all required fields:

Invoke-RestMethod -Uri http://localhost:3000/api/products `
-Method POST `
-Headers @{ "x-api-key" = "mysecretkey"; "Content-Type" = "application/json" } `
-Body '{"name": "TV"}'

✅ Expected Response:
{
  "error": true,
  "message": "Please provide all required fields: name, description, price, category"
}

3.🔒 4. Test UnauthorizedError

Try accessing the API without the API key:
Invoke-RestMethod -Uri http://localhost:3000/api/products -Method GET

✅ Expected Response:
{
  "error": true,
  "message": "Unauthorized: Invalid API key"
}

💥 5. Test Global Error Handling

To test the global middleware, you can simulate a server error (for example, by manually throwing one inside a route):

app.get('/api/test-error', (req, res) => {
  throw new Error('Something went wrong!');
});

the visit:
http://localhost:3000/api/test-error

expected outcome :
{
  "error": true,
  "message": "Something went wrong!"
}

task 5
1. Get all products (paginated)
Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
-Method GET -Headers @{ "x-api-key" = "mysecretkey" }

2. Filter by category
Invoke-RestMethod -Uri "http://localhost:3000/api/products?category=electronics" `
-Method GET -Headers @{ "x-api-key" = "mysecretkey" }

3. Search by name
Invoke-RestMethod -Uri "http://localhost:3000/api/products/search?name=Phone" `
-Method GET -Headers @{ "x-api-key" = "mysecretkey" }

4. View stats
Invoke-RestMethod -Uri "http://localhost:3000/api/products/stats" `
-Method GET -Headers @{ "x-api-key" = "mysecretkey" }


