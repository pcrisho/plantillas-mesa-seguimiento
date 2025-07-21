const listElements = document.querySelectorAll('.list__button--click');

listElements.forEach(listElement => {
    listElement.addEventListener('click', () => {
        const menu = listElement.nextElementSibling;

        // Cierra los demás desplegables
        listElements.forEach(el => {
            if (el !== listElement) {
                el.classList.remove('arrow');
                const otro = el.nextElementSibling;
                if (otro) {
                    otro.style.height = "0px";
                }
            }
        });

        const isOpen = menu.style.height && menu.style.height !== "0px";

        if (isOpen) {
            listElement.classList.remove('arrow');
            menu.style.height = "0px";
        } else {
            listElement.classList.add('arrow');
            menu.style.height = menu.scrollHeight + "px";

            // 👇 FORZAMOS actualizacion del scroll de NAV
            const nav = listElement.closest("nav");
            if (nav) {
                nav.style.overflowY = "hidden";
                void nav.offsetHeight; // Forzar reflow
                nav.style.overflowY = "auto";
            }

            // 👇 Scroll al item si se desea
            setTimeout(() => {
                listElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 300);
        }
    });
});




