
const { StatusCodes } = require('http-status-codes');
const dynamodb = require('aws-sdk/clients/dynamodb');
const documentClient = new dynamodb.DocumentClient();
exports.lambdaHandler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    await exports.resetBatchNumber(body);
  
  return {
      statusCode: StatusCodes.OK,
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  }
  catch (err) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: { message: err.message },
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  }
};

exports.resetBatchNumber = async (body) => {
  const params = exports.buildResetBatchNumberParams(body);
  await documentClient.put(params).promise();
};

exports.buildResetBatchNumberParams = (body) => {
  return {
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: 'batchCounter',
      count: 0,
      batchSize: body.batchSize ? body.batchSize : 50,
      ...body.datalist && { data: body.datalist}
    }    
  };
}