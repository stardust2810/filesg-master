INSERT INTO transaction (`id`, `uuid`, `name`, `status`, `type`, `applicationId`, `userId`) VALUES (1, 'transaction-uuid-1', 'transaction 1', 'completed', 'upload_transfer', 1, 3);

INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`) VALUES (1, 'activity-uuid-1', 'completed', 'upload', 1, 3);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (2, 'activity-uuid-2', 'completed', 'send_transfer', 1, 3, 1);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (3, 'activity-uuid-3', 'completed', 'receive_transfer', 1, 1, 1);

INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`, `ownerId`, `issuerId`) VALUES (1, 'fileAsset-uuid-1', 'file-1.oa', 'XXXXX', 'oa', 'uploaded', 1234, 'active', '{"data": "ok"}', 3, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`, `ownerId`, `issuerId`) VALUES (2, 'fileAsset-uuid-2', 'file-2.jpg', 'XXXXX', 'jpg', 'uploaded', 5678, 'active', '{"data": "ok"}', 3, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`, `ownerId`, `issuerId`) VALUES (3, 'fileAsset-uuid-3', 'file-1.oa', 'XXXXX', 'oa', 'transferred', 1234, 'active', '{"data": "ok"}', 1, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`, `ownerId`, `issuerId`) VALUES (4, 'fileAsset-uuid-4', 'file-2.jpg', 'XXXXX', 'jpg', 'transferred', 5678, 'active', '{"data": "ok"}', 1, 3);

INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (1, 1);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (1, 2);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (2, 1);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (2, 2);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (3, 3);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (3, 4);
