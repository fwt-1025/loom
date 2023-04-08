/**
 * 矩阵换算
 */
let matrix = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
    transform (a2, b2, c2, d2, e2, f2) {
        let me = this
        var
          a1 = me.a,
          b1 = me.b,
          c1 = me.c,
          d1 = me.d,
          e1 = me.e,
          f1 = me.f;
    
        /* matrix column order is:
         *   a c e
         *   b d f
         *   0 0 1
         */
        me.a = a1 * a2 + c1 * b2;
        me.b = b1 * a2 + d1 * b2;
        me.c = a1 * c2 + c1 * d2;
        me.d = b1 * c2 + d1 * d2;
        me.e = a1 * e2 + c1 * f2 + e1;
        me.f = b1 * e2 + d1 * f2 + f1;
    
        return me
    },
    translate(x, y) {
        return this.transform(1, 0, 0, 1, x, y)
    },
    scaleU(d) {
        return this.transform(d, 0, 0, d, 0, 0)
    },
    rotate(deg) {
        // let me = this
        let cos = Math.cos(deg)
        let sin = Math.sin(deg)
        // let
        // a1 = me.a,
        // b1 = me.b,
        // c1 = me.c,
        // d1 = me.d,
        // e1 = me.e,
        // f1 = me.f;
        // me.a = a1 * a2 + c1 * b2;
        // me.b = b1 * a2 + d1 * b2;
        // me.c = a1 * c2 + c1 * d2;
        // me.d = b1 * c2 + d1 * d2;
        // me.e = a1 * e2 + c1 * f2 + e1;
        // me.f = b1 * e2 + d1 * f2 + f1;
        return this.transform(cos,sin,-sin,cos,0,0)
    },
    getRotatePoint(deg, pos) {
        /**
         *  [Math.cos(deg)  -Math.sin(deg)  
            Math.sin(deg)  Math.cos(deg)]
            *
            [
                x,
                y
            ]
         */
        return {
            x: pos.x * Math.cos(deg) + pos.y * -Math.sin(deg),
            y: pos.y * Math.sin(deg) + pos.y * Math.cos(deg)
        }
    },
    clone() {
        let { a, b, c, d, e, f } = this
        return {
            a,
            b,
            c,
            d,
            e,
            f
        }
    },
    reset() {
        this.a = 1
        this.b = 0
        this.c = 0
        this.d = 1
        this.e = 0
        this.f = 0
    }
}
export default matrix