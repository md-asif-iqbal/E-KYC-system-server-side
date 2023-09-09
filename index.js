const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
const jwt = require("jsonwebtoken");
app.use(cors());
// 
// Database connection

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://AbiAbdullah:pUsZrMZS342Awr5D@cluster0.nspmanz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const SSLCommerzPayment = require("sslcommerz-lts");

const store_id = "test64e43312b7140";
const store_passwd = "test64e43312b7140@ssl";
const is_live = false;
async function run() {
  try {
    await client.connect();
    const pyament = client.db("BloodAi").collection("pyament");


    app.post("/order", async (req, res) => {
      const tran_id = new ObjectId().toString();
      const data = {
        total_amount: 12223,
        currency: "BDT",
        tran_id: tran_id,
        success_url: `http://localhost:8000/payment/success/${tran_id}`,
        fail_url: "http://localhost:3030/fail",
        cancel_url: "http://localhost:3030/cancel",
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: "abdullah",
        cus_email: "customer@example.com",
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });
        const finalOrder = {
          data,
          paidStatus: false,
          transitionId: tran_id,
        };
        const result = pyament.insertOne(finalOrder);
        console.log("Redirecting to: ", GatewayPageURL);
      });

      app.post("/payment/success/:tranId", async (req, res) => {
        console.log(req.params.tranId);
        const result = await pyament.updateOne(
          { transitionId: req.params.tranId },
          {
            $set: {
              paidStatus: true,
            },
          }
        );
        if (result.modifiedCount > 0) {
          res.redirect(`http://localhost:3000/payment/success/${tran_id}`);
        }
      });
    });
  } finally {
  }
}

run().catch;
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
