FileSG REST APIs(for Government Digital Services only).

**Note - this specification is subject to changes based on evolution of the APIs.**

# Release Notes

🔖 **1.2.0 (Sep-2023)**

- ✨ New Features:
  - Introducing the capability for agencies to onboard custom agency templates.
  - Enhancing notification options through the implementation of `v2 transaction creation`, offering support for multiple notification channels, including:
    - Email
    - SG Notify

🔖 **1.1.0 (May-2023)**

- ✨ New Features:
  - Empowering agencies with the ability to set a delete-at date for document Time-To-Live (TTL), providing greater control over document retention.
  - Enabling agencies to determine whether certain documents require acknowledgment before viewing, enhancing security and privacy measures.
  - Introducing the option for agencies to password-protect specific types of documents, such as PDFs, Excel files, and Zip archives, bolstering data protection.
  - Introducing a new feature allowing agencies to update recipient particulars, which will automatically trigger the resend of relevant notifications, ensuring information accuracy and delivery efficiency.

# Environment

The RESTful APIs are provided in both testing and live environments, and are accessible over the Internet via HTTPS.

Consumers are to ensure firewall clearance on their edge network nodes for connecting to the APIs.

The convention used by API endpoints' URLs is in the following format:

```
https://{ENV_DOMAIN_NAME}/{VERSION}/{RESOURCE}
```

- `{ENV_DOMAIN_NAME}` indicates FileSG's API domain names - respectively:

  - `Apex (Internet)`
    | ENV | Domain |
    |-----|---------------------------------------------|
    | STG | https://public-stg.api.gov.sg/gvt/dcube/fsg |
    | PRD | https://public.api.gov.sg/gvt/dcube/fsg |

  - `Apex (Intranet)`
    | ENV | Domain |
    |-----|---------------------------------------------|
    | STG | https://gw-stg.int.api.gov.sg/gvt/dcube/fsg |
    | PRD | https://gw.int.api.gov.sg/gvt/dcube/fsg |

  - Private API Gateway
    <p style="background-color:#d9edf7; color:#21739c; padding: 1em; border-radius: 0.3em;">
    ℹ️ If the endpoint has one of the following prefixes stated below, please ensure that you use the correct domain corresponding to the prefix.
    </p>

    - `/core`
      | ENV | Domain |
      |-----|---------------------------------------------|
      | STG | https://95vz7zy2j8.execute-api.ap-southeast-1.amazonaws.com |
      | PRD | https://mbvf4xpk4b.execute-api.ap-southeast-1.amazonaws.com |
    - `/transfer`
      | ENV | Domain |
      |-----|---------------------------------------------|
      | STG | https://hyf9brn605.execute-api.ap-southeast-1.amazonaws.com |
      | PRD | https://f2t8gvtu7j.execute-api.ap-southeast-1.amazonaws.com |

  > <u>**Example**</u>:
  > When calling `create transaction` API with the endpoint path `/core/v1/transaction/file/client`, it is imperative to consider the specified prefix of `/core`. Consequently, the appropriate domain to access the staging endpoint is `https://95vz7zy2j8.execute-api.ap-southeast-1.amazonaws.com`.
  >
  > The resultant POST call URL will assume the following structure:  
  > https://95vz7zy2j8.execute-api.ap-southeast-1.amazonaws.com/core/v1/transaction/file/client`

- `/{VERSION}` indicates the endpoint's release {MAJOR} version number path
- `/{RESOURCE}` indicates the API resource path name. Any additional query string parameters are appended as needed.

# Error Handling

The RESTful APIs used HTTP specification standard status codes to indicate the success or failure of each request. Except gateway errors, the response content will be in the following JSON format:

```json
{
  "data": {
    "message": "string",
    "errorCode": "string"
  },
  "timestamp": "string",
  "path": "string",
  "traceId": "string"
}
```

> **Refer to the individual API definitions for the error codes you might encounter for each API.**

# Authentication

Once the agency has been successfully onboarded, they will receive the client ID and client secrets required for authentication purposes.

Please ensure that the provided `x-client-id` and `x-client-secret` are securely stored and only accessible to authorized personnel. These credentials will be used to authenticate the agency's access to the system.

For any assistance or further information regarding the onboarding process, please contact our support team.
