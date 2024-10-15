<script>
    import { Router, Route, Link, navigate } from "svelte-routing";
    import Home from "./Home.svelte";
    import Calculate from "./Calculate.svelte";
    import { fade } from 'svelte/transition';
    import { writable } from 'svelte/store';
     
    export let url = "";
    const currentPath = writable(window.location.pathname);
    const updatePath = () => {
        currentPath.set(window.location.pathname);
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('popstate', updatePath);
    }
    const navigateAndUpdate = (to) => {
        navigate(to);
        currentPath.set(to);
    };
</script>

<Router {url}>
    <div class="min-h-screen bg-gray-100 font-sans">
      <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <img class="h-20 w-auto" src="/logo.svg" alt="Rentura Logo">
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" class="text-gray-900 inline-flex items-center pt-1 text-sm font-medium" on:click={() => navigateAndUpdate('/')}>
                  <span class={$currentPath === '/' ? "border-indigo-500 border-b-2" : ""}>Home</span>
                </Link>
                <Link to="/calculate" class="text-gray-900 inline-flex items-center pt-1 text-sm font-medium" on:click={() => navigateAndUpdate('/calculate')}>
                  <span class={$currentPath === '/calculate' ? "border-indigo-500 border-b-2" : ""}>Calculate</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Route path="/">
          {#key $currentPath}
            <div in:fade={{duration: 300, delay: 300}} out:fade={{duration: 300}}>
              <Home />
            </div>
          {/key}
        </Route>
        <Route path="/calculate">
          {#key $currentPath}
            <div in:fade={{duration: 300, delay: 300}} out:fade={{duration: 300}}>
              <Calculate />
            </div>
          {/key}
        </Route>
      </main>
      <footer class="bg-white">
        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div class="mt-8 md:mt-0 md:order-1">
            <p class="text-center text-base text-gray-400">
              &copy; 2024 Rentura. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
</Router>

<style global>
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    @import 'tailwindcss/utilities';
</style>