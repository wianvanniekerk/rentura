<script>
  import { Link } from "svelte-routing";
  import { fade } from 'svelte/transition';

  const features = [
    { icon: 'fa-calculator', title: 'Rental Price Estimation', description: 'Get accurate rental price estimates based on current market data.' },
    { icon: 'fa-chart-line ', title: 'Investment Potential', description: 'Analyse the long-term investment potential of any property.' },
    { icon: 'fa-map-marked-alt', title: 'Neighborhood Insights', description: "Access detailed information about the property's neighborhood." },
    { icon: 'fa-balance-scale', title: 'Comparative Analysis', description: 'Compare properties to make the best investment decision.' }
  ];
</script>

<div in:fade={{ duration: 400 }} class="bg-gray-50">
  <header class="bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 text-white">
    <div class="max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
      <h1 class="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">Rentura</h1>
      <p class="mt-6 max-w-3xl text-lg sm:text-2xl text-gray-100">Unlock the potential of your property investments in South Africa</p>
    </div>
  </header>

  <main>
    <section class="bg-white overflow-hidden">
      <div class="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div class="relative">
            <figure>
              <div class="aspect-w-12 aspect-h-7">
                <img class="rounded-lg shadow-xl object-cover" src="/images/property-investment.jpg" alt="Property investment" />
              </div>
            </figure>
          </div>

          <div class="lg:pl-12">
            <h2 class="text-4xl font-extrabold text-gray-900 sm:text-5xl">Make Informed Property Investment Decisions</h2>
            <p class="mt-6 text-xl text-gray-600">Enter any South African property listing URL, and we'll provide you with instant rental price estimates and investment potential analysis.</p>
            <Link to="/calculate" class="mt-8 inline-block px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition ease-in-out duration-300">Analyse a Property Now</Link>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray-100 py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Services</h2>
        <p class="mt-4 text-3xl leading-9 font-extrabold text-gray-900 sm:text-4xl">Everything you need to make smart property investments</p>

        <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          {#each features as feature}
            <div class="relative bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div class="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white mb-4">
                <i class="text-2xl fas {feature.icon}"></i>
              </div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">{feature.title}</h3>
              <p class="mt-2 text-gray-600">{feature.description}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="bg-white py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">How It Works</h2>
        <p class="mt-4 text-lg text-gray-500">Follow these simple steps to get started with Rentura</p>

        <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {#each [
            'Enter the URL of a South African property listing',
            'Our system analyses the property details and market data',
            'Receive a comprehensive report with rental estimates and investment insights',
            'Make informed decisions about your property investments'
          ] as step, i}
            <div class="relative">
              <p class="text-lg font-medium text-gray-900">Step {i + 1}</p>
              <p class="mt-2 text-gray-600">{step}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>
  </main>
</div>