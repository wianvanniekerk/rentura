<script>
  import { fade } from 'svelte/transition';
  import { Line } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
  } from 'chart.js';

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale
  );

  let url = '';
  let propertyData = null;
  let error = null;
  let loading = false;
  let calculatedRent = null;

  async function analyseProperty() {
      loading = true;
      error = null;
      propertyData = null;
      calculatedRent = null;
      try {
          const response = await fetch('http://localhost:5000/property/calculate', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url }),
          });
          const result = await response.json();
          if (!response.ok) {
              throw new Error(result.error || 'Failed to analyse property');
          }
          propertyData = result.data;
          calculatedRent = result.rent;
          console.log('Response:', result);
      } catch (err) {
          error = err.message;
      } finally {
          loading = false;
      }
  }

    $: numericPrice = propertyData && propertyData.price 
        ? parseInt(propertyData.price.replace(/[^\d]/g, '')) 
        : 0;

    $: estimatedRent = calculatedRent || (numericPrice * 0.008);

    $: rentalPricePerSquareMeter = floorSize > 0 ? estimatedRent / floorSize : 0;

    $: floorSize = propertyData && propertyData.floorSize
        ? parseFloat(propertyData.floorSize.replace(/[^\d.]/g, ''))
        : 0;

    $: erfSize = propertyData && propertyData.erfSize
        ? parseFloat(propertyData.erfSize.replace(/[^\d.]/g, ''))
        : 0;

        const formatCurrency = (value) => {
          return new Intl.NumberFormat('en-ZA', { 
              style: 'currency', 
              currency: 'ZAR',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
          }).format(value);
      };

    const formatArea = (value) => {
        return `${value.toFixed(2)} m²`;
    };
</script>

<div in:fade={{ duration: 400 }} class="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
  <h2 class="text-3xl font-extrabold text-gray-900 mb-8">Analyse Property</h2>

  <form on:submit|preventDefault={analyseProperty} class="mb-8">
      <div class="flex items-center">
          <input
              bind:value={url}
              type="url"
              required
              placeholder="Enter property URL"
              class="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
              type="submit"
              class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
          >
              {loading ? 'Analysing...' : 'Analyse'}
          </button>
      </div>
  </form>

  {#if error}
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
          <p>{error}</p>
      </div>
  {/if}

  {#if calculatedRent !== null}
    <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h3 class="text-xl font-semibold mb-2">Calculated Monthly Rent</h3>
      <p class="text-2xl text-green-600">{formatCurrency(calculatedRent)}</p>
    </div>
  {/if}

  {#if propertyData}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6" in:fade={{ duration: 300 }}>
    <div class="col-span-full bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">{propertyData.title}</h2>
      <p class="text-gray-600 mb-2">{propertyData.address}</p>
      <p class="text-xl font-semibold text-indigo-600 mb-4">{propertyData.price}</p>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span class="font-semibold">Bedrooms:</span> {propertyData.bedrooms}
        </div>
        <div>
          <span class="font-semibold">Bathrooms:</span> {propertyData.bathrooms}
        </div>
        <div>
          <span class="font-semibold">Parking:</span> {propertyData.parking}
        </div>
        {#if erfSize}
          <div>
            <span class="font-semibold">Erf Size:</span> {formatArea(erfSize)}
          </div>
        {/if}
        {#if floorSize}
          <div>
            <span class="font-semibold">Floor Size:</span> {formatArea(floorSize)}
          </div>
        {/if}
      </div>
      <p class="text-sm text-gray-600">{propertyData.description}</p>
      <div>
        {#if propertyData.images && propertyData.images.length > 0}
          <div class="grid grid-cols-2 gap-2 mt-2">
            {#each propertyData.images as image, i}
              <img src={image} alt={`Property image ${i+1}`} class="w-full h-auto rounded">
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="bg-white shadow-lg rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">Financial Insights</h3>
      <div class="mb-4">
        <p class="font-semibold">Estimated Monthly Rent:</p>
        <p class="text-lg text-green-600">{formatCurrency(estimatedRent)}</p>
      </div>
      {#if rentalPricePerSquareMeter > 0}
        <div>
          <p class="font-semibold">Rental Price per Square Meter (Monthly):</p>
          <p class="text-lg text-blue-600">{formatCurrency(rentalPricePerSquareMeter)}/m²</p>
        </div>
      {/if}
      {#if propertyData.leviesRates}
        <div class="mt-4">
          <p class="font-semibold">Monthly Levies and Rates:</p>
          <p class="text-lg text-red-600">{formatCurrency(propertyData.leviesRates)}</p>
        </div>
      {/if}
    </div>

    <div class="bg-white shadow-lg rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">Features</h3>
      <ul class="list-disc pl-5">
        {#each propertyData.features as feature}
          <li class="mb-1">{feature}</li>
        {/each}
      </ul>
    </div>

    {#if propertyData.units && propertyData.units.length > 0}
      <div class="col-span-full bg-white shadow-lg rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-4">Unit Breakdown</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each propertyData.units as unit}
            <div class="border rounded p-4">
              <p class="font-semibold">{unit.type}</p>
              <p>Price: {unit.price}</p>
              <p>Bedrooms: {unit.bedrooms}</p>
              <p>Bathrooms: {unit.bathrooms}</p>
              <p>Floor Size: {unit.floorSize}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="col-span-full text-sm text-gray-500 mt-4">
      Data sourced from: {propertyData.website}
    </div>
  </div>
{/if}
</div>