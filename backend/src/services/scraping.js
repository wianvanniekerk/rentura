const https = require('https');
const cheerio = require('cheerio');

function getRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data);
      });
    }).on("error", (error) => {
      reject(error);
    });
  });
}

function normalisePropertyData(rawData, website) {
  return {
    price: rawData.price || '',
    title: rawData.title || '',
    address: rawData.address || '',
    bedrooms: rawData.bedrooms || '',
    bathrooms: rawData.bathrooms || '',
    parking: rawData.parking || rawData.garages || '',
    floorSize: rawData.floorSize || '',
    erfSize: rawData.erfSize || '',
    description: rawData.description || '',
    images: rawData.images || [],
    features: rawData.features || [],
    units: rawData.units || [],
    website: website,
    leviesRates: rawData.leviesRates || 0,
    propertyType: rawData.propertyType || 'Unknown'
  };
}

function extractPrivatePropertyData($) {
  const rawData = {
    price: $('.listing-price-display__price').text().trim(),
    title: $('.listing-details__title').text().trim(),
    address: $('.listing-details__address').text().trim(),
    bedrooms: '',
    bathrooms: '',
    parking: '',
    floorSize: '',
    erfSize: '',
    description: $('.listing-description__text').text().trim(),
    images: [],
    features: [],
    leviesRates: 0,
    propertyType: 'Unknown'
  };

  $('.listing-details__main-feature').each((index, element) => {
    const text = $(element).text().trim();
    const iconUse = $(element).find('svg use');
    const iconHref = iconUse.length > 0 ? iconUse.attr('xlink:href') : '';

    if (iconHref) {
      if (iconHref.includes('bedrooms')) {
        rawData.bedrooms = text;
      } else if (iconHref.includes('bathrooms')) {
        rawData.bathrooms = text;
      } else if (iconHref.includes('car') || iconHref.includes('parking')) {
        rawData.parking = text;
      } else if (iconHref.includes('erf-size')) {
        rawData.erfSize = text;
      } else if (iconHref.includes('property-size')) {
        rawData.floorSize = text;
      }
    }
  });

  $('.media-container__image.media-container__image--desktop-or-larger').each((i, elem) => {
    const imgSrc = $(elem).attr('src');
    if (imgSrc) {
      rawData.images.push(imgSrc);
    }
  });

  $('.property-features__list-item').each((i, elem) => {
    try {
      const featureText = $(elem).text();
      if (featureText && typeof featureText === 'string') {
        const feature = featureText.trim();
        rawData.features.push(feature);
        if (feature.includes('Property type')) {
          const splitFeature = feature.split('Property type');
          rawData.propertyType = splitFeature[1] ? splitFeature[1].trim() : 'Unknown';
        } else if (feature.includes('Erf size') && !rawData.erfSize) {
          const splitFeature = feature.split('Erf size');
          rawData.erfSize = splitFeature[1] ? splitFeature[1].trim() : '';
        } else if (feature.includes('Floor size') && !rawData.floorSize) {
          const splitFeature = feature.split('Floor size');
          rawData.floorSize = splitFeature[1] ? splitFeature[1].trim() : '';
        } else if (feature.includes('Bedrooms') && !rawData.bedrooms) {
          const splitFeature = feature.split('Bedrooms');
          rawData.bedrooms = splitFeature[1] ? splitFeature[1].trim() : '';
        } else if (feature.includes('Bathrooms') && !rawData.bathrooms) {
          const splitFeature = feature.split('Bathrooms');
          rawData.bathrooms = splitFeature[1] ? splitFeature[1].trim() : '';
        } else if (feature.includes('Garages') || feature.includes('Open Parkings') || feature.includes('Parking')) {
          const splitFeature = feature.split(/Garages|Open Parkings|Parking/);
          const parkingValue = splitFeature[1] ? splitFeature[1].trim() : '0';
          rawData.parking = (parseInt(rawData.parking) || 0) + (parseInt(parkingValue) || 0);
        }
      }
    } catch (error) {
      console.error('Error processing feature:', error);
    }
  });

  rawData.parking = rawData.parking.toString();

  let levies = 0;
  let rates = 0;
  $('.property-features__list-item').each((i, elem) => {
    const text = $(elem).text().trim();
    if (text.toLowerCase().includes('levies')) {
      const match = text.match(/R\s*([\d\s]+)/);
      if (match) {
        levies = parseFloat(match[1].replace(/\s/g, '')) || 0;
      }
    }
    if (text.toLowerCase().includes('rates and taxes')) {
      const match = text.match(/R\s*([\d\s]+)/);
      if (match) {
        rates = parseFloat(match[1].replace(/\s/g, '')) || 0;
      }
    }
  });
  rawData.leviesRates = levies + rates;

  return normalisePropertyData(rawData, 'privateproperty');
}

function determineWebsite(url) {
  if (url.includes('privateproperty.co.za')) {
    return 'privateproperty';
  } else {
    return 'unknown';
  }
}

async function getPropertyData(url) {
  try {
    const html = await getRequest(url);
    const $ = cheerio.load(html);
    const website = determineWebsite(url);
    let propertyData;
    
    if (website === 'privateproperty') {
      propertyData = extractPrivatePropertyData($);
    } else {
      throw new Error('Unsupported website');
    }
    
    return propertyData;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = getPropertyData