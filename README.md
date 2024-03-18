<div class="text-xs-center" align="center" style="margin: 20px">
<a href="https://convocomet.dev"><img src="https://github.com/AsyncBanana/convocomet/blob/main/assets/Banner.png" alt="ConvoComet Banner"></a>
</div>

# ConvoComet

[ConvoComet](https://convocomet.dev) is an open source commenting system designed for blog owners coming from services like Disqus and Openweb. This repository contains all code for ConvoComet.

## Repository Makeup

- `/apps/` All Apps
  - `/apps/web` The main application; includes backend, dashboard frontend, and widget.
  - `/apps/docs` The documentation site
  - `/apps/testing` Small app used to simplify testing of widget integrations. Not deployed
- `/packages/` All SDKs and packages
  - `/packages/sdk` The JavaScript SDK used in the widget
  - `/packages/widgets/` All widget integration packages
    - `packages/widgets/web` The JavaScript integration. Distributed as a single script
    - `packages/widgets/react` The React integration
    - `packages/widgets/svelte` The Svelte integration
    - `packages/widgets/solid` The Solid.js integration
    - `packages/widgets/vue` The Vue integration

## Contributing

TODO
