const axios = require('axios');

// URLs for the new services (use environment variables in production)
const PYTHON_AUTH_SERVICE_URL = process.env.PYTHON_AUTH_SERVICE_URL || 'http://python-authenticity-service:5001'; // Docker service name
const JAVA_RARITY_SERVICE_URL = process.env.JAVA_RARITY_SERVICE_URL || 'http://java-rarity-service:5002'; // Docker service name

// Example: Get enhanced product details for a single product
exports.getProductWithEnhancedDetails = async (req, res) => {
    try {
        const productId = req.params.id;
        // const product = await Product.findById(productId); // Your existing Mongoose find
        // For testing, let's mock a product
        const product = {
            _id: productId,
            name: "Old Ceramic Pot",
            description: "A very old ceramic pot, possibly from the Ming dynasty.",
            category: "Ceramics",
            // ... other product fields
        };

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let authenticityData = null;
        let rarityData = null;

        try {
            const authResponse = await axios.post(`${PYTHON_AUTH_SERVICE_URL}/estimate-authenticity`, {
                name: product.name,
                description: product.description
            });
            authenticityData = authResponse.data;
        } catch (error) {
            console.error(`Error calling Python Authenticity Service: ${error.message}`);
            authenticityData = { error: "Authenticity service unavailable" };
        }

        try {
            const rarityResponse = await axios.post(`${JAVA_RARITY_SERVICE_URL}/check-rarity`, {
                name: product.name,
                category: product.category
            });
            rarityData = rarityResponse.data;
        } catch (error) {
            console.error(`Error calling Java Rarity Service: ${error.message}`);
            rarityData = { error: "Rarity service unavailable" };
        }

        res.json({
            product: product, // Your original product data
            authenticity: authenticityData,
            rarity: rarityData
        });

    } catch (error) {
        console.error(`Error in getProductWithEnhancedDetails: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching enhanced product details' });
    }
};