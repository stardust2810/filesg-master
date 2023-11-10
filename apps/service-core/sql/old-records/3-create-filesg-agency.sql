INSERT INTO `agency` (`createdAt`, `updatedAt`, `id`, `uuid`, `name`, `status`, `code`, `oaSigningKey`, `identityProofLocation`) VALUES ('2021-12-21 09:50:41.228233', '2021-12-21 09:50:41.228233', 1001, 'agency-1640080241156-2849', 'FileSG', 'active', 'FSG', '0Jf5YVfG+n8jI1N79Rzmce/FOzrudi0haCNvgeQ+EBMbE6wgy3rjeYqDme+Dx8vAmfFeo08RMOEIDOwqbK3nHPCfksbR79LfrKTb0tc4VJA3/6Nqawh7/+fXZECRYu7j', 'dev.file.gov.sg');

INSERT INTO `eservice` (`createdAt`, `updatedAt`, `id`, `uuid`, `name`, `email`, `agencyId`) VALUES ('2021-12-21 09:50:41.236603', '2021-12-21 09:50:41.236603', 1001, 'eservice-1640080241162-176d', 'FileSG', 'filesgdcube@gmail.com', 1001);

INSERT INTO user (`id`, `uuid`, `uin`, `name`, `email`, `type`, `isOnboarded`, `status`, `role`, `clientId`, `clientSecret`) VALUES (1001, 'programmaticuser-ac9da210-bdd3-437c-a353-401bc6971caf', NULL, NULL, NULL, 'programmatic', true, 'active', 'SYSTEM', 'client-uuid-1001', '$argon2id$v=19$m=4096,t=3,p=1$fLAu8z0/tflo4xDsr/s38g$qehVc6tYcujtodmxb/+Ti993NGZ1uMqCM/8g1e53Jts');

INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (1001, 1001);


