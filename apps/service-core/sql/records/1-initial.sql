INSERT INTO agency (`id`, `uuid`, `name`, `status`, `code`, `oaSigningKey`, `identityProofLocation`) VALUES (1, 'agency-1667879504467-7af6b0f4f825a18a', 'FileSG', 'active', 'FSG', '0Jf5YVfG+n8jI1N79Rzmce/FOzrudi0haCNvgeQ+EBMbE6wgy3rjeYqDme+Dx8vAmfFeo08RMOEIDOwqbK3nHPCfksbR79LfrKTb0tc4VJA3/6Nqawh7/+fXZECRYu7j', 'fsg.dev.file.gov.sg');
INSERT INTO agency (`id`, `uuid`, `name`, `status`, `code`, `oaSigningKey`, `identityProofLocation`) VALUES (2, 'agency-1654395063291-a1b2c3d4e5f6g7h9', 'NextGen', 'active', 'NG', '0Jf5YVfG+n8jI1N79Rzmce/FOzrudi0haCNvgeQ+EBMbE6wgy3rjeYqDme+Dx8vAmfFeo08RMOEIDOwqbK3nHPCfksbR79LfrKTb0tc4VJA3/6Nqawh7/+fXZECRYu7j', 'fsg.dev.file.gov.sg');

INSERT INTO eservice (`id`, `uuid`, `name`, `emails`, `agencyId`) VALUES (1, 'eservice-1667879536309-f5665f7c45cdce21', 'FileSG', 'filesgsqa+devica@gmail.com', 1);
INSERT INTO eservice (`id`, `uuid`, `name`, `emails`, `agencyId`) VALUES (2, 'eservice-1654395063372-i1j2k3l4m5n6o7p8', 'VirtualConnect', 'filesgsqa+devVirtualConnect@gmail.com', 2);

INSERT INTO application_type (`id`, `uuid`, `name`, `code`, `eserviceId`) VALUES (1, 'applicationtype-1667879607950-15ce443258bebe65', 'Long Term Visit Pass',  'LTVP', 1);
INSERT INTO application_type (`id`, `uuid`, `name`, `code`, `eserviceId`) VALUES (2, 'applicationtype-1667879302790-f024ba1d9bd2490d', 'Student Pass',          'STP',  1);
INSERT INTO application_type (`id`, `uuid`, `name`, `code`, `eserviceId`) VALUES (3, 'applicationtype-1667879302800-5342b6ed7c259794', 'Dependant Pass',        'DP',   1);
INSERT INTO application_type (`id`, `uuid`, `name`, `code`, `eserviceId`) VALUES (4, 'applicationtype-1655110619642-50dc24e793fbc1d9', 'Annual Statement',      'AS',   2);

INSERT INTO user (`id`, `uuid`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`, `uin`, `clientId`, `clientSecret`) VALUES (1, 'programmaticuser-1676524911970-86c13d13817e500b', NULL, NULL, NULL, 'programmatic', true, 'active', 'SYSTEM',                               NULL, 'programmaticuser-1676524911970-a367257c1bb20bbf', '$argon2id$v=19$m=4096,t=3,p=1$xrW9DNML+W1ziZiQMs5elg$W3ws/JJmp40csqHZ4LCahFITw+ZhQpccu4bM9U0Ohs8'); -- secret: 00cde0e606b25319b8dde9369213ed68
INSERT INTO user (`id`, `uuid`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`, `uin`, `clientId`, `clientSecret`) VALUES (2, 'programmaticuser-1676525194889-cf0d9acfe7cff038', NULL, NULL, NULL, 'programmatic', true, 'active', 'PROGRAMMATIC_WRITE',                   NULL, 'programmaticuser-1676525194889-281335a139e8e152', '$argon2id$v=19$m=4096,t=3,p=1$n2t3OW1J1S0qTmt/nRnEkQ$zrpyCb4MQ3m8mZhN2Vrn860zoYUBa3CUfk2x+n3LvAE'); -- secret: 1d7e7cc49737955b1fe8c7ccaee0fd75
INSERT INTO user (`id`, `uuid`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`, `uin`, `clientId`, `clientSecret`) VALUES (3, 'programmaticuser-1676525112832-3e0a6d3399c06747', NULL, NULL, NULL, 'programmatic', true, 'active', 'PROGRAMMATIC_READ',                    NULL, 'programmaticuser-1676525112833-c89171e96e93c6d3', '$argon2id$v=19$m=4096,t=3,p=1$y9OzoL9Twh/z8hDDfd/S8A$K0g6ji5CfgoyzkhIY8lr+K//F02IKToAeWSwCkymRqI'); -- secret: 636a8ce48184f3808a72de0b238a1925
INSERT INTO user (`id`, `uuid`, `name`, `email`, `phoneNumber`, `type`, `isOnboarded`, `status`, `role`, `uin`, `clientId`, `clientSecret`) VALUES (4, 'programmaticuser-1654395063526-y1z2a3b4c5d6e7f8', NULL, NULL, NULL, 'programmatic', true, 'active', 'PROGRAMMATIC_WRITE',                   NULL, 'programmaticuser-1654395063702-o1p2q3r4s5t6u7v8', '$argon2id$v=19$m=65536,t=3,p=4$VzfW0CiUUzdf4KhaI4tXTQ$Auv7og2esQVsHGHy3rR0W9xeoTOp6D+p6ggE6OP53jw'); -- secret:84adf9f3e10d66f017ae9ce8f6c27c23

INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (1, 1);
INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (1, 2);
INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (1, 3);
INSERT INTO eservice_user (`eserviceId`, `userId`) VALUES (2, 4);
