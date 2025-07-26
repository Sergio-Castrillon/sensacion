document.addEventListener('DOMContentLoaded', () => {
    const products = {
        'locion-hidratante': {
            name: 'Loción Hidratante',
            price: '$90.000',
            description: 'Nuestra loción hidratante está formulada con ingredientes naturales para nutrir y suavizar la piel durante todo el día. Ideal para todo tipo de piel.',
            image: 'https://placehold.co/500x500/20c997/FFFFFF/png'
        },
        'crema-corporal': {
            name: 'Crema Corporal',
            price: '$75.000',
            description: 'Enriquecida con manteca de karité y aceites esenciales, nuestra crema corporal deja la piel suave, tersa y delicadamente perfumada.',
            image: 'https://placehold.co/500x500/20c997/FFFFFF/png'
        },
        'desodorante-natural': {
            name: 'Desodorante Natural',
            price: '$45.000',
            description: 'Protección eficaz y duradera sin aluminio ni parabenos. Formulado con ingredientes naturales que cuidan tu piel.',
            image: 'https://placehold.co/500x500/20c997/FFFFFF/png'
        },
        'serum-rejuvenecedor': {
            name: 'Sérum Rejuvenecedor',
            price: '$120.000',
            description: 'Un potente concentrado de antioxidantes y vitaminas que combate los signos del envejecimiento y devuelve la luminosidad a tu rostro.',
            image: 'https://placehold.co/500x500/20c997/FFFFFF/png'
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const productKey = urlParams.get('product');

    if (productKey && products[productKey]) {
        const product = products[productKey];
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = product.price;
        document.getElementById('product-description').textContent = product.description;
        document.getElementById('main-product-image').src = product.image;
    }
});