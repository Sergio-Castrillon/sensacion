document.addEventListener('DOMContentLoaded', () => {
    
    // Selecciona todos los botones de "Añadir al Carrito"
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // Añade un evento de click a cada botón
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Evita que la página se recargue si el botón está en un formulario
            event.preventDefault();

            // Lógica simple de feedback
            // En un proyecto real, aquí se actualizaría el estado del carrito
            alert('¡Producto añadido al carrito!');

            // Opcional: Cambiar el texto del botón
            const clickedButton = event.target;
            clickedButton.textContent = 'Añadido ✓';
            clickedButton.disabled = true; // Deshabilitar para evitar múltiples clics
            
            setTimeout(() => {
                clickedButton.textContent = 'Añadir al Carrito';
                clickedButton.disabled = false;
            }, 2000); // Revertir después de 2 segundos
        });
    });

    // Lógica para los filtros de productos
    const filterLinks = document.querySelectorAll('.filters a');
    const productCards = document.querySelectorAll('.product-card');

    filterLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            // Remover la clase 'active' de todos los links
            filterLinks.forEach(link => link.classList.remove('active'));

            // Añadir la clase 'active' al link seleccionado
            const clickedLink = event.target;
            clickedLink.classList.add('active');

            const filter = clickedLink.dataset.filter;

            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

});