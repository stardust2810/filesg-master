INSERT INTO application_type_notification (`notificationChannel`, `applicationTypeId`) VALUES ('EMAIL', 1);
INSERT INTO application_type_notification (`notificationChannel`, `applicationTypeId`) VALUES ('EMAIL', 2);
INSERT INTO application_type_notification (`notificationChannel`, `applicationTypeId`) VALUES ('EMAIL', 3);
INSERT INTO application_type_notification (`notificationChannel`, `applicationTypeId`) VALUES ('EMAIL', 4);
INSERT INTO application_type_notification (`notificationChannel`, `applicationTypeId`) VALUES ('SG_NOTIFY', 4);


INSERT INTO transaction_custom_message_template (`uuid`, `name`, `template`, `requiredFields`, `type`, `agencyId`) VALUES ('transactioncustommessagetemplate-1686281948104-2b8af53efee10d15', 'ICA-Digital-Pass',   '["Please click “Open in FileSG” to view your {{applicationName}} ({{applicationCode}}).","We recommend that you register for Singpass, subjected to eligbility, to access your digital documents on FileSG more easily."]', 'applicationName,applicationCode', 'ISSUANCE', 1);
INSERT INTO transaction_custom_message_template (`uuid`, `name`, `template`, `requiredFields`, `type`, `agencyId`) VALUES ('transactioncustommessagetemplate-1655625225500-9c72b9eac3dc42f6', 'AS-TEST',            '["Annual Statement - Important Information for Parents for child, {{childName}}","Please make the necesssary payment by {{deadline}}","If you have any questions or require further information, please don`t hesitate to contact us at {{agencyContact}}"]', 'childName,deadline,agencyContact', 'ISSUANCE', 2);
INSERT INTO transaction_custom_message_template (`uuid`, `name`, `template`, `requiredFields`, `type`, `agencyId`) VALUES ('transactioncustommessagetemplate-1663634758184-abc5d1e23624f9b8', 'AS-BASE',            '["{{randomeData1}}", "{{randomeData2}}", "{{randomeData3}}"]', 'randomeData1,randomeData2,randomeData3', 'ISSUANCE', 2);

INSERT INTO notification_message_template (`uuid`, `name`, `template`, `requiredFields`, `version`, `type`, `externalTemplateId`, `notificationChannel`, `agencyId`) VALUES ('notificationmessagetemplate-1655110619632-a4eef62bcfc8d97a', 'DIGITAL-PASS+EMAIL','["Please click “Open in FileSG” to view your {{applicationName}} ({{applicationCode}}).","We recommend that you register for Singpass, subjected to eligbility, to access your digital documents on FileSG more easily."]', 'applicationName,applicationCode', 1, 'ISSUANCE', NULL, 'EMAIL', 1 );
INSERT INTO notification_message_template (`uuid`, `name`, `template`, `requiredFields`, `version`, `type`, `externalTemplateId`, `notificationChannel`, `agencyId`) VALUES ('notificationmessagetemplate-1655625225511-1b06d874f253cbb1', 'AS-EMAIL',          '["Annual Statement - Important Information for Parents for child, {{childName}}","Please make the necesssary payment by {{deadline}}","If you have any questions or require further information, please don`t hesitate to contact us at {{agencyContact}}"]', 'childName,deadline,agencyContact', 1, 'ISSUANCE', NULL, 'EMAIL', 2 );
INSERT INTO notification_message_template (`uuid`, `name`, `template`, `requiredFields`, `version`, `type`, `externalTemplateId`, `notificationChannel`, `agencyId`) VALUES ('notificationmessagetemplate-1655625225523-df03ea218acd90e9', 'AS-SG-NOTIFY-01',   '{}','recipient_name,agency_ref_no,transaction_id,io_name,unit,io_email,officer_name', 1, 'ISSUANCE', 'FILESG-SPF-01', 'SG_NOTIFY', 2 );
INSERT INTO notification_message_template (`uuid`, `name`, `template`, `requiredFields`, `version`, `type`, `externalTemplateId`, `notificationChannel`, `agencyId`) VALUES ('notificationmessagetemplate-1665326476912-5b46e54c5b675c3a', 'AS-SG-NOTIFY-02',   '{}','agencyName', 1, 'ISSUANCE', 'FILESG-ISSUE-DOC-01', 'SG_NOTIFY', 2 );
