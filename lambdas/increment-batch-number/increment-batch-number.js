
const { StatusCodes } = require('http-status-codes');
const dynamodb = require('aws-sdk/clients/dynamodb');
const documentClient = new dynamodb.DocumentClient();
exports.lambdaHandler = async (event) => {
  try {
    const response = await exports.updateBatchNumber();
    const includeBatch = event.queryStringParameters && event.queryStringParameters.include && event.queryStringParameters.include.toLowerCase() == 'batch';

    const body = {
      batchNumber: response.count,
      ...includeBatch && { batch: exports.getBatch(response) }
    }
    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify(body),
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  }
  catch (err) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: { message: err.message },
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  }
};

exports.getBatch = (response) => {
  let batch = [];
  if (response.data && Array.isArray(response.data)) {
    const batchNumber = response.count;
    const batchSize = response.batchSize;
    batch = response.data.slice(batchNumber * batchSize, (batchNumber + 1) * batchSize);
  }

  return batch;
}

exports.updateBatchNumber = async () => {
  const params = exports.buildUpdateBatchNumberParams();
  const result = await documentClient.update(params).promise();

  return result.Attributes;
};

exports.buildUpdateBatchNumberParams = () => {
  return {
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: 'batchCounter'
    },
    UpdateExpression: 'add #count :value',
    ExpressionAttributeNames: {
      '#count': 'count'
    },
    ExpressionAttributeValues: {
      ':value': 1
    },
    ReturnValues: 'ALL_NEW'
  };
}