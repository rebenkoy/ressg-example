document.addEventListener("DOMContentLoaded", function() {
    const masonry_data_tag = "masonry";
    const masonry_gap_var = "--masonry--gap";
    const masonry_max_height_var = "--masonry--max-height";
    const masonry_min_cols_var = "--masonry--min-cols";
    const masonry_column_class = "masonry__column";

    const grids = document.querySelectorAll(`[data-${masonry_data_tag}]`);

    function query_height(height) {
        const div = document.createElement("div");
        div.style.top = `0`;
        div.style.position = "absolute";
        div.style.width = `0`;
        div.style.height = `${height}`;
        document.body.appendChild(div);
        const res = div.getBoundingClientRect().height;
        document.body.removeChild(div);
        return res;
    }

    /**
     * @param {Element} grid
     */
    function resizeGrid(grid) {
        const item_selector = grid.dataset[masonry_data_tag];

        const styles = window.getComputedStyle(grid);
        const max_height = query_height(styles.getPropertyValue(masonry_max_height_var));
        const gap = query_height(styles.getPropertyValue(masonry_gap_var));  // This might cause problems
        const min_cols = Number(styles.getPropertyValue(masonry_min_cols_var));

        const cards = [];
        let total_cards_height = 0;
        let i = 0;
        for (const el of grid.getElementsByClassName(item_selector)) {
            const height = el.getBoundingClientRect().height;
            el.masonry_ordering = i++;
            cards.push([height, el]);
            total_cards_height += height;
        }
        cards.sort((a, b) => b[0] - a[0] === 0 ? a[1].masonry_ordering - b[1].masonry_ordering : b[0] - a[0]);
        const actual_height = Math.max(max_height, cards[0][0]);
        // opt_cols -> min | opt_cols * actual_height > total_cards_height + (cards.length - opt_cols) * row_gap
        // opt_cols -> min | opt_cols * (actual_height + row_gap) > total_cards_height + cards.length * row_gap
        const opt_cols = Math.ceil((total_cards_height + cards.length * gap) / (actual_height + gap));
        const columns = pack(Math.max(min_cols, opt_cols), cards, gap, actual_height);
        place(grid, columns);
    }

    /**
     * @param {Element} grid
     * @param {Element[][]} columns
     */
    function place(grid, columns) {
        const cols = fix_n_cols(grid, columns.length);
        for (let i = 0; i < cols.length; i++) {
            for (const el of columns[i]) {
                cols[i].appendChild(el);
            }
        }
    }

    /**
     * @param {Element} grid
     * @param {number} n_cols
     * @return {Element[]}
     */
    function fix_n_cols(grid, n_cols) {
        const current = Array.from(grid.getElementsByClassName(masonry_column_class));
        if (current.length === n_cols) {
            return current;
        }
        if (current.length < n_cols) {
            for (let i = n_cols - current.length; i > 0; i--) {
                const col = document.createElement("div");
                col.className = masonry_column_class;
                grid.appendChild(col);
                current.push(col);
            }
            return current;
        }
        for (let i = current.length - n_cols; i > 0; i--) {
            grid.removeChild(current[i]);
            current.splice(i, 1);
        }
        return current;
    }

    function get_shortest(cols) {
        let shortest_height = cols[0][0];
        let shortest_idx = 0;
        for (let i = 1; i < cols.length; i++) {
            const [h, _] = cols[i];
            if (h < shortest_height) {
                shortest_height = h;
                shortest_idx = i;
            }
        }
        return cols[shortest_idx];
    }

    function place_to(col, height, element, padding_height) {
        if (col[1].length !== 0) {
            col[0] += padding_height;
        }
        col[0] += height;
        col[1].push(element);
    }

    function pack_n_cols(n_cols, cards, padding_height) {
        const cols = [];
        for (let i = 0; i < n_cols; i++) {
            cols.push([0, []]);
        }
        for (const [h, el] of cards) {
            place_to(get_shortest(cols), h, el, padding_height);
        }
        return cols;
    }

    /**
     * @param {number} opt_n_col
     * @param {(number, Element)[]} cards
     * @param {number} max_height
     * @param {number} padding_height
     * @return {Element[][]}
     */
    function pack(opt_n_col, cards, padding_height, max_height) {
        let max_pack_height;
        let packing;
        do {
            packing = pack_n_cols(opt_n_col, cards, padding_height);
            max_pack_height = 0
            for (const [h, _] of packing) {
                max_pack_height = Math.max(max_pack_height, h);
            }
            opt_n_col += 1;
        } while (max_pack_height > max_height);

        packing.sort((a, b) => b[0] - a[0]);
        return packing.map((c) => c[1]);
    }

    function set_callbacks() {
        for (const grid of grids) {
            grid.setup_masonry = () => resizeGrid(grid);
        }
    }

    function resizeAll() {
        for (const grid of grids) {
            grid.setup_masonry();
        }
    }

    window.addEventListener("resize", function() {
        resizeAll();
    })
    set_callbacks();
    resizeAll();
})