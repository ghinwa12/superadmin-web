# Shared Supabase helpers

Import from apps via Vite alias `@shared/*` or relative path.

```ts
import type { DoctorProfile } from "@shared/types";
import { listApprovedDoctors } from "@shared/api";
```

Requires `@supabase/supabase-js` in the consuming app.
