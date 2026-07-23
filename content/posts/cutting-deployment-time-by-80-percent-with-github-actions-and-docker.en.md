---
title: "Cutting Deployment Time by 80% with GitHub Actions and Docker"
date: 2026-06-03T10:00:00+07:00
tags: ["github-actions", "docker", "ci-cd", "devops", "laravel"]
cover:
  image: "/images/cutting-deployment-time-by-80-percent-with-github-actions-and-docker/cover.webp"
description: "How I cut deployment time by 80% by replacing a slow manual process with GitHub Actions and Docker."
slug: "cutting-deployment-time-by-80-with-github-actions-and-docker"
draft: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowToc: true
---

##### Photo by <a href="https://unsplash.com/@bruno_kelzer?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Bruno Kelzer</a> on <a href="https://unsplash.com/photos/person-holding-green-and-gray-leaf-UZuNn5yjHpc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

A while back, I was working on a project for a client. Day to day, I'm a backend engineer, but in this project the scope expanded. I had to dip into the server side as well. The client wanted to migrate their Laravel application from **AWS Elastic Beanstalk** to **AWS Lightsail**, aiming to cut infrastructure costs and gain more control over the server.

As someone who enjoys learning, this was actually an exciting moment. I'd been comfortable in the backend zone, and now I had the chance to get my hands on infrastructure and DevOps work directly.

Beanstalk had been incredibly convenient, the entire deployment process was automated. Push code, done. But once we moved to Lightsail, everything changed. Suddenly I had to set up the server from scratch, configure Docker, and the most frustrating part: **a completely manual deployment process**.

## The Problem: Manual Deployment That Took Forever

In the initial Lightsail setup, every time I wanted to deploy changes to production, here's the ritual I had to go through:

1. Push commits to GitHub
2. Create a release tag (`git tag -a v1.2.3 -m "release note" && git push origin v1.2.3`)
3. SSH into the Lightsail server
4. `git fetch --tags` and `git checkout` the new tag
5. Run `docker compose up -d --build`
6. If there were database changes, hop into the container with `docker exec` then manually run `php artisan migrate --force`

All of these steps took about **2-3 minutes**. And when you're rushing because there's a critical bug in servers that need to be fixed quickly, every second felt painfully slow.

But the real issue wasn't the duration. It was **the sheer number of manual steps**, each one a potential point of human error. Once, I forgot to run the migration after deploying, and immediately got errors because a new database column didn't exist yet. Pretty embarrassing, all because I was in a hurry and there were too many steps.

So the question popped up: why not just automate all of this? Back when I was working at a startup, the infra team had already set up a pipeline like this. How about I figure it out and build it myself?

## The Solution: GitHub Actions Workflow

Since the code was already on GitHub and the server was using Docker, the answer was clear: **GitHub Actions**. With `workflow_dispatch`, we can create a workflow triggered manually from the Actions tab — complete with input parameters.

You might be wondering, why not trigger it automatically on every commit or merge to `main`? Wouldn't that be more convenient?

Here's the reasoning behind the manual trigger:

1. **No surprise changes in production**. Every deployment must be intentional, not a side effect of a merge
2. **The whole team stays aware** because before deploying, the person responsible has to go to the Actions tab and run it consciously
3. **Versioning is mandatory** — with the tag input, we're forced to create a version for every deployment. If something goes wrong down the line, we can roll back to a previous tag

Alright, so the concept is simple:

- Push commits and create tags as usual
- Open the **Actions** tab in the GitHub repository
- Select the **Deploy Production** workflow
- Enter the tag you want to deploy
- Check the box if you want to run database migrations
- Click **Run workflow**, and... just wait

No more SSH, no more `docker exec`, no more worrying about forgetting migrations. Deployments that used to take 2-3 minutes now finish in an average of **40 seconds** (most of that is waiting for Docker to build).


![GitHub Actions Deploy Production workflow duration](/images/cutting-deployment-time-by-80-percent-with-github-actions-and-docker/github-actions-duration.png)

Let's take a look at how this workflow is built.

## Building the Workflow

The workflow lives at `.github/workflows/deploy.yml`. Here's the basic structure:

```yaml
name: Deploy Production

on:
  workflow_dispatch:
    inputs:
      tag:
        description: "Git tag to deploy (example: v1.2.3)"
        required: true
        type: string
      run_migration:
        description: "Run database migration?"
        required: false
        type: boolean
        default: false
```

With the `workflow_dispatch` configuration above, GitHub will display a simple form every time we want to run the workflow. There are two inputs:

1. **tag**, i.e. the Git tag to deploy, required
2. **run_migration**, i.e. a checkbox to run database migrations, optional

Pretty straightforward. Now let's dive into the `jobs` section.

### SSH into the Server

The first step is setting up an SSH connection to the Lightsail server using an SSH key stored as a GitHub Secret:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
```

Here we're saving the private key to `id_ed25519` with permission `600` (readable only by the owner). Then we add the server's host key to `known_hosts` so the SSH connection isn't rejected.

Keep in mind, all sensitive information like `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_USER`, and `APP_PATH` should be stored as **GitHub Secrets**. Never hardcoded in the workflow file.

### Checkout Tag and Deploy

Once the SSH connection is ready, we send commands to the server to fetch tags, checkout, and build with Docker:

```yaml
      - name: Deploy to Server
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} "export GITHUB_PAT='${{ secrets.CREDENTIAL_GITHUB_PAT }}' && bash -s" << 'EOF'
            set -e

            set +o history

            cd ${{ secrets.APP_PATH }}

            echo "Temporarily set Git remote with token"
            ORIGINAL_URL=$(git remote get-url origin)
            REPO_PATH=${ORIGINAL_URL#https://github.com/}

            git config --local credential.helper '!f() { echo "username=x-access-token"; echo "password=${GITHUB_PAT}"; }; f'

            echo "Fetch tags"
            git fetch --tags

            echo "Checkout tag: ${{ github.event.inputs.tag }}"
            git checkout -f ${{ github.event.inputs.tag }}

            echo "Remove credential helper"
            git config --local --unset credential.helper

            echo "Deploy with Docker Compose"
            export USER_ID=$(id -u)
            export GROUP_ID=$(id -g)
            docker compose up -d --build

            set -o history

            echo "Deployment completed successfully!"
          EOF
```

There are a few interesting things here. Let's break them down.

First, we're using a **heredoc** (`<< 'EOF'`) to send a block of shell commands to the server over SSH. This is much cleaner than writing everything inline in one long line.

Second, we're using a **Git credential helper** instead of storing the token in the remote URL. This is more secure because the credential helper is removed right after `git checkout` completes. The token only lives for the duration of that command.

Third, notice `set +o history` at the top. This disables bash history temporarily so the GitHub token doesn't get recorded in the server's shell history. A small security detail that's often overlooked.

Fourth, `export USER_ID` and `GROUP_ID` are needed so the Docker container runs with the same user ID as the host, keeping file permissions consistent.

### Running Migrations

The final piece is the option to run database migrations:

```yaml
            # Run migration if requested
            if [ "${{ github.event.inputs.run_migration }}" == "true" ]; then
              echo "Running database migration..."
              docker exec container_app php artisan migrate --force
              echo "Migration completed!"
            else
              echo "Skipping migration"
            fi
```

Pretty straightforward. Check if the `run_migration` input is `true`. If yes, run `php artisan migrate --force` inside the `container_app` container. The `--force` flag is needed because Artisan usually prompts for confirmation in production environments.

This part used to be the most annoying. Often, right after `docker compose up -d` finished, I had to quickly `docker exec` to run migrations before any requests hit the new tables. Now it's just ticking a box and we're done.

## The Final Result

With the workflow ready, deploying now is as simple as:

1. **Push commits** and **create a tag** (`git tag v1.2.3 && git push origin v1.2.3`)
2. Open the repository on GitHub, **Actions** tab → select **Deploy Production** → click **Run workflow**
3. Enter the tag you want to deploy
4. Check `Run database migration?` if there are database changes
5. Click **Run workflow** and wait for the success notification

Here's the before-and-after comparison:

| Step | Before (Manual) | After (GitHub Actions) |
|------|-----------------|------------------------|
| Checkout code on server | SSH → `git fetch` → `git checkout` | Automated via workflow |
| Build & deploy | `docker compose up -d --build` | Automated via workflow |
| Database migration | SSH → `docker exec` → `php artisan migrate` | Check a checkbox |
| Total time | **2–3 minutes** | **~40 seconds** (input params) |
| Human error risk | High (missed steps) | Low (standardized) |

From **2-3 minutes** down to **~40 seconds** — that's roughly an **80% reduction in deployment time**. But more important than the time savings is this: deployments are now **consistent** and **free from human error**.

## Conclusion

Migrating from Beanstalk to Lightsail definitely pushed me out of my backend engineer comfort zone and into infrastructure territory I'd previously left to automated services, deployment included. But that's exactly where the learning happens.

With GitHub Actions `workflow_dispatch`, we can build a simple CI/CD pipeline that's just as convenient as managed services like Beanstalk. All you really need is:

- A repository on GitHub
- A server accessible via SSH
- An application containerized with Docker
- A single workflow YAML file

Sure, this pipeline may not be as sophisticated as Jenkins or GitLab CI with automatic rollback and approval gates. But for small teams or personal projects, it's more than enough.

If you have any additions or corrections to the discussion above, let's talk in the comments. Hope this helps 👋.
