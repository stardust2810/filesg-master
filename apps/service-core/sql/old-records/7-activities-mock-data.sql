INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`) VALUES (5, 'user-uuid-5', 'a5UsyLyk0Aq5Tsj2iahmxpqYRsMqb4YrSqcij5DG0OU=', 'Mock S1234567A', 'mock-S1234567A@test.email.com', '11111111', 'citizen', true, 'active', 'CITIZEN');

INSERT INTO transaction (`id`, `uuid`, `name`, `status`, `type`, `applicationId`, `userId`) VALUES (5, 'transaction-uuid-5', 'transaction 5', 'completed', 'upload_transfer', 1, 3);

INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`) VALUES (5, 'activity-uuid-5', 'completed', 'upload', 5, 3);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (6, 'activity-uuid-6', 'completed', 'send_transfer', 5, 3, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (7, 'activity-uuid-7', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (8, 'activity-uuid-8', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (9, 'activity-uuid-9', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (10, 'activity-uuid-10', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (11, 'activity-uuid-11', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (12, 'activity-uuid-12', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (13, 'activity-uuid-13', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (14, 'activity-uuid-14', 'completed', 'receive_transfer', 5, 5, 5);

INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (15, 'activity-uuid-15', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (16, 'activity-uuid-16', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (17, 'activity-uuid-17', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (18, 'activity-uuid-18', 'completed', 'receive_transfer', 5, 5, 5);

INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (19, 'activity-uuid-19', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (20, 'activity-uuid-20', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (21, 'activity-uuid-21', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (22, 'activity-uuid-22', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (23, 'activity-uuid-23', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (24, 'activity-uuid-24', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (25, 'activity-uuid-25', 'completed', 'receive_transfer', 5, 5, 5);
INSERT INTO activity (`id`, `uuid`, `status`, `type`, `transactionId`, `userId`, `parentId`) VALUES (26, 'activity-uuid-26', 'completed', 'receive_transfer', 5, 5, 5);

INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`, `ownerId`, `issuerId`) VALUES (61, 'fileAsset-uuid-61', 'file-1.oa', 'XXXXX', 'oa', 'uploaded', 1234, 'active', '{"data": "ok"}', 3, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`, `ownerId`, `issuerId`) VALUES (62, 'fileAsset-uuid-62', 'file-2.jpg', 'XXXXX', 'jpg', 'uploaded', 5678, 'active', '{"data": "ok"}', 3, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`,`parentId`, `ownerId`, `issuerId`) VALUES (63, 'fileAsset-uuid-63', 'file-1.oa', 'XXXXX', 'oa', 'transferred', 1234, 'active', '{"data": "ok"}', 61, 5, 3);
INSERT INTO file_asset (`id`, `uuid`, `name`, `documentHash`, `documentType`, `type`, `size`, `status`, `metadata`,`parentId`, `ownerId`, `issuerId`) VALUES (64, 'fileAsset-uuid-64', 'file-2.jpg', 'XXXXX', 'jpg', 'transferred', 5678, 'active', '{"data": "ok"}', 62, 5, 3);

INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (5, 61);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (5, 62);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (6, 61);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (6, 62);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (7, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (7, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (8, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (8, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (9, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (9, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (10, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (10, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (11, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (11, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (12, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (12, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (13, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (13, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (14, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (14, 64);

INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (15, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (15, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (16, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (16, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (17, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (17, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (18, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (18, 64);

INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (19, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (19, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (20, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (20, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (21, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (21, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (22, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (22, 64);

INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (23, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (23, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (24, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (24, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (25, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (25, 64);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (26, 63);
INSERT INTO activity_file (`activityId`, `fileAssetId`) VALUES (26, 64);
