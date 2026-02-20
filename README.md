# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## System Design

### Sequence Diagram (Login → User Input → Recommendations → Recovery)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant R as React App (Router)
  participant AP as AuthProvider/useAuth
  participant AU as Auth Page (/auth)
  participant IX as Index (/)
  participant HUD as useUserData
  participant HDF as HealthDataForm
  participant UR as useRecommendations
  participant DB as Database (profiles/health_data/progress_history/...)
  participant FN as Backend Function (generate-recommendations)
  participant LS as Browser Storage (localStorage)

  Note over U,R: App start / page refresh
  R->>AP: mount()
  AP->>AP: onAuthStateChange(listener)
  AP->>AP: getSession() (restore persisted session)
  alt Session exists
    AP-->>R: user/session available
  else No session
    AP-->>R: user = null
  end

  alt User not authenticated
    R->>IX: navigate("/")
    IX-->>R: Redirect to /landing
    R->>AU: navigate("/auth")
    AU-->>U: Show Login / Sign Up

    Note over U,AU: Login
    U->>AU: Enter email + password
    AU->>AP: signIn(email,password)
    AP->>DB: Authenticate user (credentials)
    DB-->>AP: Session created
    AP-->>R: onAuthStateChange(session)
    R->>IX: navigate("/")
  else User already authenticated
    R->>IX: navigate("/")
  end

  Note over IX,HUD: Load persisted user data after login/refresh
  IX->>HUD: fetchUserData(user_id)
  par Read user tables
    HUD->>DB: SELECT profiles WHERE user_id
    HUD->>DB: SELECT health_data WHERE user_id
    HUD->>DB: SELECT user_streaks WHERE user_id
    HUD->>DB: SELECT user_badges WHERE user_id
    HUD->>DB: SELECT progress_history (recent) WHERE user_id
  end
  DB-->>HUD: results
  HUD-->>IX: profile/healthData/streak/badges/progressHistory

  alt healthData missing (first time)
    IX-->>HDF: Render HealthDataForm (baseline input)
    Note over U,HDF: Input from user
    U->>HDF: Enter age/gender/height/weight/conditions/diet
    HDF->>HUD: saveHealthData(formData)
    par Persist baseline health + progress snapshot
      HUD->>DB: UPSERT health_data
      HUD->>DB: INSERT progress_history (weight,bmi,conditions)
    end
    DB-->>HUD: OK
    HUD-->>IX: refetchUserData()
  else healthData exists
    IX-->>IX: Render Dashboard
  end

  Note over IX,UR: Exercise recommendations
  IX->>UR: generateRecommendations(profile.name, healthData, progressHistory)
  UR->>FN: invoke generate-recommendations(userData)
  alt Recommendation success
    FN-->>UR: recommendations JSON
    UR->>LS: setItem(cachedRecommendations)
    UR-->>IX: recommendations state updated
  else Network/server issue
    UR->>LS: getItem(cachedRecommendations)
    alt Cache exists
      LS-->>UR: cached recommendations
      UR-->>IX: Use cached + show warning
    else No cache
      UR-->>IX: Show error + allow retry
    end
  end

  Note over U,R: "Where does it restart?"
  Note over R,AP: On refresh/app relaunch: restart at AuthProvider getSession() → fetchUserData() → generateRecommendations()
```

### Recovery Behavior

| Scenario | Restart Point |
|----------|---------------|
| Page refresh / app relaunch | `getSession()` → `fetchUserData()` → `generateRecommendations()` |
| Network issue during recommendations | Retry at `generateRecommendations()` step; uses cached data if available |
| Server issue during data fetch | Retry at `fetchUserData()` step on next reload |

