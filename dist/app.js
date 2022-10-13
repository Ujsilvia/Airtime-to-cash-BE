"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const database_config_1 = __importDefault(require("./config/database.config"));
const accounts_1 = __importDefault(require("./routes/accounts"));
database_config_1.default.sync().then(() => {
    console.log('Database Connected Successfully');
}).catch(err => {
    console.log(err);
});
const indexRouter_1 = __importDefault(require("./routes/indexRouter"));
const usersRouter_1 = __importDefault(require("./routes/usersRouter"));
const transactionsRouter_1 = __importDefault(require("./routes/transactionsRouter"));
const withdrawalRouter_1 = __importDefault(require("./routes/withdrawalRouter"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // included cors
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/', indexRouter_1.default);
app.use('/users', usersRouter_1.default);
app.use('/account', accounts_1.default);
app.use('/transactions', transactionsRouter_1.default);
app.use('/withdrawal', withdrawalRouter_1.default);
// Error handling
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
});
exports.default = app;
