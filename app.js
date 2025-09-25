const express = require('express')
const app = express()
app.use(express.json());
require('dotenv').config();

//Imports routes
const utilRoutes = require('./Routes/util.routes');
const partnerRoutes = require('./Routes/partner.routes');
const attachmentRoutes = require('./Routes/attachment.routes');
const bankAccountRoutes = require('./Routes/bankAccount.routes');
const productRoutes = require('./Routes/product.routes');
const invoiceRoutes = require('./Routes/invoice.routes');
const companyRoutes = require('./Routes/company.routes');
const bankRoutes = require('./Routes/bank.routes');

//app config
const port = process.env.PORT;

//Routes
app.use('/util', utilRoutes);
app.use('/partner', partnerRoutes);
app.use('/attachment', attachmentRoutes);
app.use('/bankAccount', bankAccountRoutes);
app.use('/product', productRoutes);
app.use('/invoice', invoiceRoutes);
app.use('/company', companyRoutes);
app.use('/bank', bankRoutes);

app.listen(port, () => {
  console.log(`app listening on port ${port} ✅`)
})