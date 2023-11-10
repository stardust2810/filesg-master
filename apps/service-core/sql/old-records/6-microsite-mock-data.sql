INSERT INTO transaction (`id`, `uuid`, `name`, `status`, `type`, `applicationId`, `userId`) VALUES (3001, 'transaction-uuid-3001', 'transaction 1', 'completed', 'upload_transfer', 1, 3);

INSERT INTO activity (`id`, `uuid`,`status`, `type`, `transactionId`, `userId`) VALUES (3001, 'activity-uuid-3001', 'completed', 'upload', 3001, 3);
INSERT INTO activity (`id`, `uuid`,`status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (3002, 'activity-uuid-3002', 'completed', 'send_transfer', 3001, 3, 3001);
INSERT INTO activity (`id`, `uuid`,`status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (3003, 'activity-uuid-3003', 'completed', 'receive_transfer', 3001, 9, 3001);

INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`, `ownerId`, `issuerId`) VALUES (3001, 'fileAsset-uuid-3001', 'file-1.oa', 'XXXXX', 'oa', 'uploaded', 1234, 'active', '{"data": "ok"}', 3, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`, `ownerId`, `issuerId`) VALUES (3002, 'fileAsset-uuid-3002', 'file-2.jpg', 'XXXXX', 'jpg', 'uploaded', 5678, 'active', '{"data": "ok"}', 3, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`,`parentId`, `ownerId`, `issuerId`) VALUES (3003, 'fileAsset-uuid-3003', 'file-1.oa', 'XXXXX', 'oa', 'transferred', 1234, 'active', '{"data": "ok"}', 3001, 9, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`,`parentId`, `ownerId`, `issuerId`) VALUES (3004, 'fileAsset-uuid-3004', 'file-2.jpg', 'XXXXX', 'jpg', 'transferred', 5678, 'active', '{"data": "ok"}', 3002, 9, 3);

INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (3001, 3001);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (3001, 3002);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (3002, 3001);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (3002, 3002);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (3003, 3003);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (3003, 3004);
