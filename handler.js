const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  GetCommand,
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const dbDocumentClient = DynamoDBDocumentClient.from(client);
const Table = "Abc";

exports.create = async (event) => {
  try {
    const item = JSON.parse(event.body || "{}");
    item.id = Date.now().toString();

    const params = {
      TableName: Table,
      Item: item,
    };
    
    await dbDocumentClient.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(item), 
    };
  } catch (e) {
    console.error("Error in create function:", e);
    return {
      statusCode: 400,
      body: JSON.stringify({
        errorType: e.name,
        errorMessage: e.message,
        stack: e.stack,
      }),
    };
  }
};

exports.get = async (event) => {
  const params = {
    TableName: Table,
    Key: { id: event.pathParameters.id },
  };

  const { Item } = await dbDocumentClient.send(new GetCommand(params));

  if (!Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Item not found" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(Item),
  };
};

exports.update = async (event) => {
  try {
    const id = event.pathParameters.id;
    const body = JSON.parse(event.body);

    const params = {
      TableName: Table,
      Key: { id },
      UpdateExpression: "set #name = :name, #email = :email",
      ExpressionAttributeNames: {
        "#name": "name",
        "#email": "email",
      },
      ExpressionAttributeValues: {
        ":name": body.name,
        ":email": body.email,
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dbDocumentClient.send(
      new UpdateCommand(params)
    );

    return {
      statusCode: 200,
      body: JSON.stringify(Attributes),
    };
  } catch (e) {
    console.error("Error in create function:", e);
    return {
      statusCode: 400,
      body: JSON.stringify({
        errorType: e.name,
        errorMessage: e.message,
        stack: e.stack,
      }),
    };
  }
};

exports.deleteItem = async (event) => {
  const params = {
    TableName: Table,
    Key: { id: event.pathParameters.id },
  };

  await dbDocumentClient.send(new DeleteCommand(params));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Item deleted" }),
  };
};
