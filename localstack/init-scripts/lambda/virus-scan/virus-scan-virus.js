const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const handleRecord = async (record) => {
  const {
    messageId,
    attributes: { SentTimestamp },
    body,
  } = record;

  const s3Data = JSON.parse(body).Records[0].s3;

  const snsClient = new SNSClient({
    region: 'ap-southeast-1',
    endpoint: 'http://localhost:4566',
  });

  const virusMessage = {
    timestamp: SentTimestamp / 1000,
    sqs_message_id: messageId,
    xamz_request_id: 'dummy',
    file_url: `https://s3-fsg2-localezapp-file-stg.s3.ap-southeast-1.amazonaws.com/${s3Data.object.key}`,
    scanner_status: 0,
    scanner_status_message: 'successful scan',
    scanning_result: {
      TotalBytesOfFile: s3Data.object.size,
      Findings: [
        {
          malware: 'Eicar_test_file',
          type: 'Virus',
        },
      ],
      Error: '',
      Codes: [],
    },
  };

  try {
    const data = await snsClient.send(
      new PublishCommand({
        Message: JSON.stringify(virusMessage),
        TopicArn: 'arn:aws:sns:ap-southeast-1:000000000000:sns-fsg2-localezapp-ScanResultTopic',
      }),
    );

    console.log(`Success: ${JSON.stringify(data)}`);
    console.log(`Published Message: ${JSON.stringify(virusMessage)}`);
  } catch (err) {
    console.log('Error', err.stack);
  }
};

exports.handler = async ({ Records }, context) => {
  for (const record of Records) {
    await handleRecord(record);
  }
};
