"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = (req, res) => {
    const params = req.swagger.params;
    console.log(JSON.stringify(params));
    if (!params.q) {
        res.status(400).json();
    }
    else {
        let obj = {
            type: 'asdf',
            code: 4,
            array: [
                4,
                'asf',
                55,
                44,
            ]
        };
        res.json({
            element: obj,
            elements: [obj, obj],
            req: 'as'
        });
    }
};
//# sourceMappingURL=game.controller.js.map