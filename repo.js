var csvtojson = require('csvtojson');
var json2csv = require('json2csv');
var fs = require('fs');

const productsAndServicesPath = __dirname + "/data/products_and_services.csv";
const productDependenciesPath = __dirname + "/data/product_dependencies.csv";

function parseArray(arrayStr) {
    let replaceStr = arrayStr.replace(/\[|\]/, "");
    let strArray = replaceStr.split(",");
    let intArray = []
    for (let i = 0; i < strArray.length; i++) {
        let element = strArray[i];
        let num = parseInt(element);
        intArray.push(num);
    }
    return intArray;
}

async function getProducts() {
    let json = await csvtojson().fromFile(productsAndServicesPath);
    let parsedJson = [];
    for (let i = 0; i < json.length; i++) {
        parsedJson.push({
            id: parseInt(json[i].id),
            name: json[i].name,
            category: parseInt(json[i].category),
            description: json[i].description,
            department: json[i].department,
            serviceLevel: parseInt(json[i].serviceLevel),
            externalPatners: json[i].externalPatners,
            otherDepartments: json[i].otherDepartments
        });
    }
    return {
        status: 200,
        json: parsedJson
    }
}

async function searchProduct(field, value) {
    let products = [];
    let result = await getProducts();
    let status = result.status;
    let json = result.json;
    for (let i = 0; i < json.length; i++) {
        if (json[i][field] == value) {
            products.push(json[i]);
        }
    }
    if (products.length == 0) {
        status = 404;
    }
    return {
        status: status,
        json: products
    }
}

async function createNewProduct(reqBody) {
    let id = 1;
        let products = (await getProducts()).json;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id >= id) {
                id = products[i].id + 1;
            }
        }

        const product = {
            id: id,
            name: reqBody.name,
            category: reqBody.category,
            description: reqBody.description,
            department: reqBody.department,
            serviceLevel: reqBody.serviceLevel,
            externalPatners: reqBody.externalPatners,
            otherDepartments: reqBody.otherDepartments
        }

        let json2csvParser = new json2csv.Parser({header: false});
        let csvStr = json2csvParser.parse(product);
        fs.appendFileSync(productsAndServicesPath, csvStr + "\n", 'utf8');
    return {
        status: 201,
        json: {
            id: id
        }
    }
}

async function updateProduct(reqBody) {
    let result = await getProducts();
    let product;
    let foundId = false;
    let products = result.json;
    let status = result.status;
    for (let i = 0; i < products.length; i++) {
        product = products[i];
        if (product.id === reqBody.id) {
            foundId = true;
            product.name = reqBody.name;
            product.category = parseInt(reqBody.category);
            product.description = reqBody.description;
            product.department = reqBody.department;
            product.serviceLevel = parseInt(reqBody.serviceLevel);
            product.externalPatners = reqBody.externalPatners;
            product.otherDepartments = reqBody.otherDepartments;
            break;
        }
    }

    if (foundId) {
        let json2csvParser = new json2csv.Parser();
        let csvStr = json2csvParser.parse(products);
        fs.writeFileSync(productsAndServicesPath, csvStr + "\n", 'utf8');
    } else {
        status = 404;
        product = {};
    }
    return {
        status: status,
        json: product
    }
}

async function getDependencies() {
    let json = await csvtojson().fromFile(productDependenciesPath);
    let parsedJson = [];
    for (let i = 0; i < json.length; i++) {
        parsedJson.push({
            id: parseInt(json[i].id),
            dependencies: parseArray(json[i].dependencies),
            noDependencies: parseArray(json[i].noDependencies),
            multiDependencies: parseArray(json[i].multiDependencies)
        });
    }
    return {
        status: 200,
        json: parsedJson
    }
}

async function searchDependencies(id) {
    let result = await getDependencies();
    let status = result.status;
    let json = result.json;
    let found = [];
    for (let i = 0; i < json.length; i++) {
        if (json[i].id == id) {
            found.push(json[i]);
            break;
        }
    }

    if (found.length == 0) {
        status = 404;
    }
    return {
        status: status,
        json: found[0]
    }
}

async function addDependencies(id, reqBody) {
    const product = {
        id: id,
        dependencies: reqBody.dependencies
    }

    let result = await getDependencies();
    let status = result.status;
    let json = result.json;

    let foundId = -1;
    for (let i = 0; i < json.length; i++) {
        if (json[i].id == product.id) {
            foundId = i;
            break;
        }
    }

    if (foundId != -1) {
        json[foundId].dependencies = product.dependencies;
    } else {
        json.push(product);
    }

    let json2csvParser = new json2csv.Parser();
    let csvStr = json2csvParser.parse(json);
    fs.writeFileSync(productDependenciesPath, csvStr, 'utf8');
    return {
        status: status,
        json: product
    }
}

module.exports = {
    getProducts: getProducts,
    searchProduct: searchProduct,
    createNewProduct: createNewProduct,
    updateProduct: updateProduct,
    addDependencies: addDependencies,
    searchDependencies: searchDependencies
}
