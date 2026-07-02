# Foundation User Provisioning Guide

Scope: controlled Panacea OS Foundation users for external web login.

Do not commit real user files, password hashes, private keys, refresh-token stores, or operational credentials to Git.

## User File

Copy the example file to a secured server location:

```sh
sudo mkdir -p /etc/panacea/foundation-auth
sudo cp foundation-users.example.json /etc/panacea/foundation-auth/foundation-users.json
sudo chmod 600 /etc/panacea/foundation-auth/foundation-users.json
```

Edit `/etc/panacea/foundation-auth/foundation-users.json` on the server only.

## Required Users

### Project Owner

```json
{
  "userId": "project-owner-user-id",
  "username": "project-owner",
  "displayName": "Project Owner",
  "tenantId": "utbe-health-system",
  "passwordHash": "ARGON2ID_HASH_GENERATED_OUTSIDE_GIT",
  "roles": ["operator"],
  "permissions": [
    "panacea:operate",
    "panacea:read",
    "panacea:write",
    "read",
    "global_command_intelligence.read_models.read",
    "global_command_intelligence.write_workflows.write",
    "global_command_intelligence.write_workflows.read",
    "global_command_intelligence.write_workflows.retry"
  ],
  "enabled": true
}
```

### Administrator / Security

```json
{
  "userId": "security-administrator-user-id",
  "username": "security-admin",
  "displayName": "Security Administrator",
  "tenantId": "utbe-health-system",
  "passwordHash": "ARGON2ID_HASH_GENERATED_OUTSIDE_GIT",
  "roles": ["administrator"],
  "permissions": [
    "panacea:admin",
    "panacea:read",
    "panacea:write",
    "read",
    "global_command_intelligence.read_models.read",
    "global_command_intelligence.write_workflows.write",
    "global_command_intelligence.write_workflows.read",
    "global_command_intelligence.write_workflows.retry"
  ],
  "enabled": true
}
```

## Generate Argon2id Password Hash

Run this from the repository root on the server. The password is read without echoing when the terminal supports hidden input:

```sh
npm run foundation:hash-password
```

The command prints only the Argon2id hash. Paste that value into the `passwordHash` field in `/etc/panacea/foundation-auth/foundation-users.json`.

Do not store the plaintext password in shell history, Git, environment files, logs, screenshots, or documentation.

## Required JWT Claims After Login

The provider issues access tokens with:

- `iss`: `https://foundation.utbe.ai`
- `aud`: `panacea-os`
- `sub`: user id
- `name`: display name
- `tenantId`: `utbe-health-system`
- `roles`: role array
- `permissions`: permission array
- `iat`
- `exp`
- `jti`

For operational Hospital Core use, the `project-owner` and administrator tokens must include both the platform-level Panacea permissions and the service-level permissions used by the live command service:

- `read`
- `global_command_intelligence.read_models.read`
- `global_command_intelligence.write_workflows.write`
- `global_command_intelligence.write_workflows.read`
- `global_command_intelligence.write_workflows.retry`

If the server already has `/etc/panacea/foundation-auth/foundation-users.json`, update that secured server file with the permissions above and restart the Foundation Auth Provider. A valid password alone is not sufficient; patient list, patient file opening, and Hospital Core transactions require these claims in the issued token.

## Validation

After the provider starts:

```sh
curl -s https://foundation.utbe.ai/.well-known/openid-configuration
curl -s https://foundation.utbe.ai/.well-known/jwks.json
```

Use the Panacea web secure access page for credential validation:

```text
https://panacea.utbe.ai/#/auth/login
```

## Governance

Accounts should be approved by the project owner and security owner. Remove or disable accounts immediately when access is no longer required.
