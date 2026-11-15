# Money Bosses Premium Member card follow-up

## Status

Development-only update on `feature/money-bosses-command-center`. No production route, database, Shopify connection, membership issuance, or wallet pass was activated.

## Card design status

The newly supplied Money Bosses Premium Member portrait card PNG is now the active customer-facing card reference for the admin module:

`client/public/money-bosses/mb-001-founding-member-card-approved.png`

SHA-256:

`be0c94ed5dc8fc46b9f82501a0a958849ce93bcd5ff92aa21b4a8c908c23d74d`

The previous MB–001 Founding Member artwork remains preserved as an archived reference at:

`client/public/money-bosses/archive/mb-001-founding-member-card-archived.jpg`

Archived artwork SHA-256:

`c43815a2eee80b3b75f9ed6321a7991305ab367157010bed2525bab8ca9d1a7e`

Neither asset was edited or recompressed.

## Module updates

- The dashboard now uses Premium Member terminology.
- The active card panel uses the supplied portrait card.
- No visible membership number is required or displayed in the card panel.
- Preferred display names remain optional and server-verified.
- Profile photographs remain optional, consent-controlled, and deletion-aware.
- The migration default tier is `premium_member`.
- The migration default card version is `premium-member-v1`.
- Apple Wallet, Google Wallet, and Samsung Wallet remain `not_configured` and disabled.

## Verification

- The protected route remains `/admin/money-bosses`.
- Command Center navigation still targets the protected route.
- The existing Atlanta Archives scanner and public Money Bosses customer portal were not rebuilt or modified.
- Focused migration tests and frontend/backend builds remain required after this asset-only follow-up.

## Remaining blockers

- Staging PostgreSQL is not available in the current sandbox, so migration forward/rollback execution remains pending.
- Real Shopify identity and qualifying-purchase verification are not connected.
- Membership issuance and wallet-provider credentials are not available.
- No Apple, Google, or Samsung pass is generated.
