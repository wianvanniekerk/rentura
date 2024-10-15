const getPropertyData = require('../services/scraping');

let getPrice = (str) => {
  const index = str.indexOf('R ');
  if (index !== -1) {
    let priceStr = str.slice(index + 2).replace(/\s+/g, '');
    return parseFloat(priceStr);
  }
  return null;
}

let getArea = (str) => {
  const index = str.indexOf(' in ');
  return index !== -1 ? str.slice(index + 4).trim() : null;
}

let getSquareFootage = (str) => {
  if (!str) return null;
  let footageStr = str.match(/\d+(\.\d+)?/);
  return footageStr ? parseFloat(footageStr[0]) : null;
};


let extractNumericFeatures = (str) => {
  let match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

let estimateRent = (purchasePrice, title, floorSize, erfSize, leviesRates, bedrooms, bathrooms, extraFeatures, propertyType) => {
  const isCommercial = propertyType.toLowerCase().includes('commercial');
  const baseRentPercentage = isCommercial ? 0.0050 : 0.0040;
  const baseRent = getPrice(purchasePrice) * baseRentPercentage;
  
  const parsedFloorSize = getSquareFootage(floorSize);
  const parsedErfSize = getSquareFootage(erfSize);
 
  if (parsedFloorSize === null && parsedErfSize === null) {
    console.warn("Warning: Both floor size and erf size are invalid or missing.");
    return null;
  }

  let areaFactor = 1;
  switch (getArea(title)) {
    case "Pretoria":
      areaFactor = 1.05;
      break;
    case "Cape Town":
      areaFactor = 1.1;
      break;
    //I'll add more areas in the future
  }

  const areaAdjustment = baseRent * areaFactor;
  
  let sizeAdjustment = 0;
  if (parsedFloorSize) {
    sizeAdjustment += isCommercial 
      ? (parsedFloorSize / 100) * 0.01 * baseRent
      : (parsedFloorSize / 1000) * 0.05 * baseRent;
  }
  if (parsedErfSize) {
    sizeAdjustment += isCommercial
      ? (parsedErfSize / 10000) * 0.005 * baseRent
      : (parsedErfSize / 1000) * 0.02 * baseRent; 
  }

  let roomAdjustment = 0;
  if (!isCommercial) {
    roomAdjustment = (extractNumericFeatures(bedrooms) * 0.03 + extractNumericFeatures(bathrooms) * 0.02) * baseRent;
  }

  const filteredFeatures = extraFeatures.filter(feature => !feature.includes('Listing number'));
  const numericFeatures = filteredFeatures.map(feature => extractNumericFeatures(feature));
  const featureAdjustment = numericFeatures.reduce((sum, value) => sum + value, 0) * (isCommercial ? 0.0005 : 0.001);

  const typeFactors = isCommercial
    ? {
        "Commercial": 1.0,
        "Office": 1.1,
        "Retail": 1.2,
        "Industrial": 0.9,
      }
    : {
        "Apartment": 1.0,
        "Townhouse": 0.9,
        "Flat": 0.9,
        "Vacant Land": 0.8,
        "Plot": 0.8,
        "Cluster": 1.0,
        "House": 1.0,
        "Farm": 1.1,
        "Smallholding": 1.0
      };

  const typeAdjustment = baseRent * ((typeFactors[propertyType] || 1.0) - 1);
  let totalRent = baseRent + areaAdjustment + sizeAdjustment + roomAdjustment + featureAdjustment + typeAdjustment;
  let finalRent = totalRent + (leviesRates || 0);

  const minAnnualRentPercentage = isCommercial ? 0.08 : 0.06;
  const minAnnualRent = getPrice(purchasePrice) * minAnnualRentPercentage;
  if (finalRent * 12 < minAnnualRent) {
    finalRent = minAnnualRent / 12;
  }

  return Math.round(finalRent * 100) / 100;
};

exports.analyseProperty = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !(url.includes('privateproperty.co.za'))) {
      return res.status(400).json({ error: 'Invalid URL. Only privateproperty.co.za is supported.' });
    }

    const urlParts = new URL(url).pathname.split('/');
    if (urlParts[1] === 'to-rent') {
      return res.status(400).json({ error: 'Rental properties cannot be analysed. Please provide a URL for a property for sale.' });
    }

    const propertyData = await getPropertyData(url);
    const rent = estimateRent(
      propertyData.price,
      propertyData.title,
      propertyData.floorSize,
      propertyData.erfSize,
      propertyData.leviesRates,
      propertyData.bedrooms,
      propertyData.bathrooms,
      propertyData.features,
      propertyData.propertyType
    );
    res.json({ message: 'Property analyzed successfully', data: propertyData, rent: rent});
  } catch (error) {
    console.error('Error analyzing property:', error);
    if (error.message === 'Unsupported website') {
      res.status(400).json({ error: 'Unsupported website' });
    } else {
      res.status(500).json({ error: 'Error analyzing property: ' + error.message });
    }
  }
};