# Foundation User Provisioning Guide

Scope: controlled Panacea OS Foundation users for external web login.

Do not commit real user files, password hashes, private keys, refresh-token stores, or operational credentials to Git.

## User File

Copy the example file to a secured server location:

```sh
sudo mkdir -p /etc/panacea
sudo cp foundation-users.example.json /etc/panacea/foundation-users.json
sudo chmod 600 /etc/panacea/foundation-users.json
```

Edit `/etc/panacea/foundation-users.json` on the server only.

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
    "global_command_intelligence.write_workflows.write"
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
    "panacea:write"
  ],
  "enabled": true
}
```

## Generate Argon2id Password Hash

Run this on the server. The password is read without echoing:

```sh
printf "Password: "
stty -echo
IFS= read -r FOUNDATION_PASSWORD
stty echo
printf "\n"

FOUNDATION_PASSWORD="$FOUNDATION_PASSWORD" node --input-type=module <<'NODE'
import { hashFoundationUserPassword } from "./scripts/lib/foundation-auth-provider.mjs";
console.log(hashFoundationUserPassword(process.env.FOUNDATION_PASSWORD));
NODE
unset FOUNDATION_PASSWORD
```

Place only the resulting Argon2id hash into `/etc/panacea/foundation-users.json`.

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
