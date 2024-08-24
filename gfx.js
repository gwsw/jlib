// Mark's graphics library

// --------------------------------------------------------------------
class Color {
    constructor(hex) {
        this.hex_str = hex;
    }
    static new_rgb(r,g,b) {
        return new Color(hex2(r) + hex2(g) + hex2(b));
    }
    hex() {
        return this.hex_str;
    }
    fade(color2, frac) {
        if (frac <= 0) return this;
        if (frac >= 1) return color2;
        let color_str = "";
        for (let c = 0; c <= 2; ++c) {
            const c1 = this.get_comp(c);
            const c2 = color2.get_comp(c);
            color_str += hex2(c1 + ((c2-c1) * frac));
        }
        return new Color(color_str);
    }
    jstring() {
        return "#" + this.hex_str;
    }
    get_comp(comp) {
        return parseInt(this.hex_str.substr(comp*2, 2), 16);
    }
    red() { return this.get_comp(0); }
    green() { return this.get_comp(1); }
    blue() { return this.get_comp(2); }
    darker(mult) {
        return new Color(hex2(this.get_comp(0)*mult) + hex2(this.get_comp(1)*mult) + hex2(this.get_comp(2)*mult));
    }
    opposite() {
        return new Color(hex2(255-this.get_comp(0)) + hex2(255-this.get_comp(1)) + hex2(255-this.get_comp(2)));
    }
    contrast() {
        const bright = this.get_comp(0) + this.get_comp(1) + this.get_comp(2);
        return new Color((bright > (3*128)) ? "000000" : "ffffff");
    }
};

// --------------------------------------------------------------------
class Point {
    constructor(x,y) {
        this.move(x,y);
    }
    move(x,y) {
        this.x = x;
        this.y = y;
    }
    dist(pt) {
        return Math.sqrt(this.dist2(pt));
    }
    dist2(pt) {
        const dx = pt.x - this.x;
        const dy = pt.y - this.y;
        return (dx*dx + dy*dy);
    }
    toward(pt, dist) {
        const pdist = this.dist(pt);
        const eps = .01; // FIXME
        if (pdist < eps) return pt; 
        const frac = dist / pdist;
        const nx = this.x + frac * (pt.x - this.x);
        const ny = this.y + frac * (pt.y - this.y);
        return new Point(nx, ny);
    }
    rotate(angle) {
        let pol = this.to_polar();
        pol.theta += angle;
        return Point.to_cart(pol);
    }
    to_polar() {
        return {
            rho: Math.sqrt(this.x * this.x + this.y * this.y),
            theta: Math.atan2(this.y, this.x) };
    }
    static to_cart(pol) {
        return new Point(
            pol.rho * Math.cos(pol.theta),
            pol.rho * Math.sin(pol.theta));
    }
    toString() {
        return this.x.toString()+","+this.y.toString();
    }
};

// --------------------------------------------------------------------
class Graphics {
    constructor(ctx, font_size) {
        this.ctx = ctx;
        if (font_size)
            this.set_font_size(font_size);
    }
    set_font_size(font_size) {
        this.ctx.font = Math.floor(font_size).toString()+"px sans-serif";
        this.font_height = font_size;
    }
    get_font_size() {
        const s = this.ctx.font.match(/^[0-9]*/);
        return Number(s[0]);
    }
    clear(color) {
        const dims = this.canvas_dims();
        this.ctx.clearRect(0, 0, dims.w, dims.h);
        this.draw_rect(0, 0, dims.w, dims.h, color);
    }
    canvas_dims() {
        const canvas = this.ctx.canvas;
        return { w : canvas.width, h : canvas.height };
    }
    draw_rect(x, y, w, h, color) {
        if (color != undefined && color != null) this.ctx.fillStyle = color.jstring();
        this.ctx.fillRect(x, y, w, h);
    }
    draw_centered_rect(cx, cy, w, h, color) {
        this.draw_rect(cx - w/2, cy - h/2, w, h, color);
    }
    draw_outline(x, y, w, h, xb, yb, color) {
        this.draw_rect(x,      y,       w-xb,   yb,   color);
        this.draw_rect(x+w-xb, y,       xb,     h-yb, color);
        this.draw_rect(x+xb,   y+h-yb,  w-xb,   yb,   color);
        this.draw_rect(x,      y+yb,    xb,     h-yb, color);
    }
    draw_centered_outline(cx, cy, w, h, xb, yb, color) {
        this.draw_outline(cx - w/2, cy - h/2, w, h, xb, yb, color);
    }
    draw_outlined_rect(x, y, w, h, xb, yb, bg_color, border_color) {
        this.draw_rect(x+xb, y+yb, w-2*xb, h-2*yb, bg_color);
        this.draw_outline(x, y, w, h, xb, yb, border_color);
    }
    draw_line(x0,y0, x1,y1, color, width = 1) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color.jstring();
        this.ctx.lineWidth = width;
        this.ctx.moveTo(x0,y0);
        this.ctx.lineTo(x1,y1);
        this.ctx.stroke();
    }
    // dir in radians
    draw_poly(pts, x, y, dir, scale, stroke, fill) {
        this.ctx.beginPath();
        let pt0 = pts[0].rotate(dir);
        this.ctx.moveTo(x+pt0.x*scale, y+pt0.y*scale);
        for (let i = 1; i < pts.length; ++i) {
            const pt = pts[i].rotate(dir);
            this.ctx.lineTo(x+pt.x*scale, y+pt.y*scale);
        }
        this.ctx.lineTo(x+pt0.x*scale, y+pt0.y*scale); // close polygon
        if (stroke != null) {
            this.ctx.strokeStyle = stroke.jstring();
            this.ctx.stroke();
        }
        if (fill != null) {
            this.ctx.fillStyle = fill.jstring();
            this.ctx.fill();
        }
    }
    draw_circle(x, y, r, color) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color.jstring();
        this.ctx.arc(x, y, r, 0, 2*Math.PI);
        this.ctx.fill();
    }
    draw_text(x, y, text, color) {
        this.ctx.fillStyle = color.jstring();
        this.ctx.fillText(text, x, y+this.font_height);
    }
    measure_text(text) {
        let max_width = 0;
        let num_lines = 0;
        for (let line of text.split("\n")) {
            const text_size = this.ctx.measureText(line);
            if (text_size.width > max_width) max_width = text_size.width;
            ++num_lines;
        }
        return { width: max_width, height: this.font_height * num_lines };
    }
    draw_centered_text(x, y, w, text, color) {
        const text_size = this.measure_text(text);
        const nx = x + (w - text_size.width) / 2;
        if (nx > x) x = nx;
        this.draw_text(x, y, text, color);
        return text_size;
    }
    static end_word(text, p) {
        for (; p < text.length; ++p) {
            if (text.substr(p,1) != " ") break;
        }
        for (; p < text.length; ++p) {
            if (text.substr(p,1) == " " || text.substr(p,1) == "\n") break;
        }
        return p;
    }
    split_text(text, width) {
        let lines = [];
        let line = 0;
        for (;;) {
            // Skip spaces.
            while (text.substr(line,1) == " ")
                ++line;
            let end_line = line;
            // Output line starts here; step thru words.
            for (;;) {
                if (end_line >= text.length) {
                    if (end_line > line) lines.push(text.substr(line, end_line-line));
                    return lines;
                }
                const newline = (text.substr(end_line,1) == "\n");
                let e = -1;
                if (!newline) e = Graphics.end_word(text, end_line);
                if (newline || this.measure_text(text.substr(line, e-line)).width >= width) {
                    if (end_line == line && !newline) { // we must break a word
                        while (e > line && this.measure_text(text.substr(line, e-line)).width >= width)
                            e = e - 1;
                        end_line = e;
                    }
                    lines.push(text.substr(line, end_line-line));
                    line = end_line;
                    if (newline) ++line;
                    break;
                }
                end_line = e;
            }
        }
    }
    draw_paragraph(msg, x, y, w, color, center = false, list_char = "") {
        const lines = this.split_text(msg, w);
        const line_h = this.font_height;
        const list_indent = (list_char.length == 0) ? 0 : this.measure_text(list_char).width;
        for (let i = 0; i < lines.length; ++i) {
            let line = lines[i];
            let tx = x;
            let center_line = center;
            if (line.substr(0,1) == "\t") {
                center_line = true;
                line = line.substr(1);
            }
            if (center_line) {
                const tw = this.measure_text(line).width;
                tx += Math.floor((w - tw) / 2);
            }
            if (list_char.length > 0 && line.substr(0,list_char.length) != list_char)
                tx += list_indent;
            if (color != null) this.draw_text(tx, y, line, color);
            y += line_h;
        }
        return { w: w, h: lines.length * line_h };
    }
    draw_vcentered_paragraph(msg, x, y, w, h, color, center = false, list_char = "") {
        const msg_size = this.measure_text(msg);
        y += (h - msg_size.height) / 2;
        return this.draw_paragraph(msg, x, y, w, color, center, list_char);
    }
   // just < 0 => left justify
   // just > 0 => right justify
   // just == 0 => centered
   draw_just_text(x, y, w, text, just, color, color_shadow = null) {
       const text_size = this.measure_text(text);
       let nx = x;
       if (just == 0)
           nx = x + (w - text_size.width) / 2;
       else if (just > 0)
           nx = x + w - text_size.width;
       if (nx > x) x = nx;
       if (color_shadow != null) this.draw_text(x+config.shadow_shift, y+config.shadow_shift, text, color_shadow);
       this.draw_text(x, y, text, color);
       return text_size;
   }
}; // class Graphics

// --------------------------------------------------------------------

function el(name) {
    return document.getElementById(name);
}

function now() {
    return performance.now();
}

function randu(n) {
    return Math.floor(Math.random() * n);
}

function padnum(num, len, radix) {
    return Math.floor(num).toString(radix).padStart(len,"0");
}
function hex2(num) { return padnum(num, 2, 16); }

function zmod(x, m) {
    if (x >= 0) return x % m;
    let r = (-x) % m;
    if (r > 0) r = m - r;
    return r;
}

function munge_config() {
    const params = new URLSearchParams(window.location.search);
    for (const [key,value] of Object.entries(config)) {
        const repl = params.get(key);
        if (repl != null)
            config[key] = typeof config[key] == "string" ? repl : Number(repl);
        if (key.substr(0,6) == "color_")
            config[key] = new Color(config[key]);
    }
}

