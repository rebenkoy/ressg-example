document.addEventListener("DOMContentLoaded", function() {
    const data_tag = "data-slider";
    const slider_content_class = "slider__content";
    const slider_controls_class = "slider__controls";
    const slider_button_class = "slider__button";
    const slider_button_clicked_class = "slider__button--clicked";
    const slider_visible_slides_var = "--slider--visible-slides";
    const slider_gap_var = "--slider--gap";

    const grids = document.querySelectorAll(`[${data_tag}]`);

    function query_width(width) {
        const div = document.createElement("div");
        div.style.top = `0`;
        div.style.position = "absolute";
        div.style.width = `${width}`;
        div.style.height = `0`;
        document.body.appendChild(div);
        const res = div.getBoundingClientRect().width;
        document.body.removeChild(div);
        return res;
    }

    /**
     * @param {Element} grid
     */
    function resizeGrid(grid) {
        const container = grid.getElementsByClassName(slider_content_class)[0];
        const controls = grid.getElementsByClassName(slider_controls_class)[0];

        const styles = window.getComputedStyle(grid);
        const visible_items = Number(styles.getPropertyValue(slider_visible_slides_var));
        const gap = query_width(styles.getPropertyValue(slider_gap_var));

        setup_controls(controls, container, gap, visible_items);
    }

    /**
     *
     * @param {Element} controls
     * @param {Element} main_element
     * @param {number} gap
     * @param {number} min_cols
     */
    function setup_controls(controls, main_element, gap, min_cols) {
        const buttons = []
        const offset = main_element.children[0].getBoundingClientRect().left;
        for (let i = 0; i + min_cols <= main_element.children.length; i++) {
            const left = main_element.children[i].getBoundingClientRect().left - offset;
            const control = document.createElement("div");
            control.classList.add(slider_button_class);
            control.innerText = `${i + 1}`;
            control.target = left;
            control.onclick = (e) => {
                main_element.last_clicked.classList.remove(slider_button_clicked_class);
                main_element.last_clicked = e.target;
                main_element.last_clicked.classList.add(slider_button_clicked_class);
                main_element.scrollTo({"left": left, "top": 0, "behavior": "smooth"});
            }
            buttons.push(control);
        }
        if (buttons.length <= 1) {
            buttons.pop();
        }
        if (buttons.length > 0) {
            main_element.last_clicked = buttons[0];
            main_element.last_clicked.classList.add(slider_button_clicked_class);
        }
        controls.replaceChildren(...buttons);
    }


    function set_callbacks() {
        for (const grid of grids) {
            grid.slider_setup = () => resizeGrid(grid);
        }
    }

    function setupAll() {
        for (const grid of grids) {
            grid.slider_setup();
        }
    }

    window.addEventListener("resize", function() {
        setupAll();
    })

    set_callbacks();
    setupAll();
})