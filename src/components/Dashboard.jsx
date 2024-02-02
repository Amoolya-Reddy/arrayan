import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardHeader,
} from "reactstrap";
import { FETCH_TRANSACTION } from "../utils/ResDbApis";
import { sendRequest } from "../utils/ResDbClient";
import { Line } from "react-chartjs-2";
import GraphSetup from "./GraphSetup";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function Dashboard() {
  //TODO: Remove encryption keys from code
  const metadata = {
    recipientPublicKey: process.env.REACT_APP_ADMIN_PUBLIC_KEY,
  };

  const [TransactionCount, setTransactionCount] = useState({
    "Jan": 0,
    "Feb": 0,
    "Mar": 0,
    "Apr": 0,
    "May": 0,
    "Jun": 0,
    "Jul": 0,
    "Aug": 0,
    "Sep": 0,
    "Oct": 0,
    "Nov": 0,
    "Dec": 0
  });

  const [totalStats, setTotalStats] = useState({
    "products": 0,
    "industries": 0,
    "byproducts": 0,
    "txns": 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const distinctValuesCount = (array, propertyName) => {
    const values = array.map(obj => obj[propertyName]);
    const uniqueValues = new Set(values);
    return uniqueValues.size;
  };

  const fetchData = async () => {
    console.log("Fetching data...");
    const query = FETCH_TRANSACTION(
      "",
      metadata.recipientPublicKey
    );
    try {
      let totalTxns = {...TransactionCount};
      let totalCount = {...totalStats};
      let json =[];
      sendRequest(query).then((res) => {
        if (res && res.data && res.data.getFilteredTransactions) {
          res.data.getFilteredTransactions.forEach((item) => {
            let info = JSON.parse(item.asset.replace(/'/g, '"')).data;
            let ts = new Date(info["Timestamp"]).toLocaleString("default", {month: 'short'});
            json.push(info);
            totalCount["txns"]++;
            if (ts != NaN && ts != undefined) {
              totalTxns[ts]++;
            }
          });
          totalCount["products"] = distinctValuesCount(json, 'Industry');
          totalCount["byproducts"] = distinctValuesCount(json, 'ByProducts');
          totalCount["industries"] = distinctValuesCount(json, 'Name');
            setTotalStats(prev => ({prev, totalCount}));
            setTransactionCount( prev => ({prev, totalTxns}));
        // } else {
        //   fetchData(); // BUG: Temporary fix for the intermittent graphql error
        }
      });
    } catch (error) {
      console.log("Fetching data error ", error);
    }
  };

  return (
    <section className="section section-lg">
      <Container>
        <Row className="justify-content-center text-center">
          <h3>Stats</h3>

          <Col className="mt-lg-5" md="5">
            <Card className="card-stats bg-default">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="tim-icons icon-bank text-warning" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <CardTitle tag="p">{totalStats.totalCount?.industries}</CardTitle>
                      <p />
                      <p className="card-category">
                        Participating Organizations
                      </p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col className="mt-lg-5" md="5">
            <Card className="card-stats bg-default">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="tim-icons icon-delivery-fast text-primary" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <CardTitle tag="p">{totalStats.totalCount?.products}</CardTitle>
                      <p />
                      <p className="card-category">Products</p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col className="mt-lg-5" md="5">
            <Card className="card-stats bg-default">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="tim-icons icon-cart text-danger" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <CardTitle tag="p">{totalStats.totalCount?.byproducts}</CardTitle>
                      <p />
                      <p className="card-category">ByProducts</p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col className="mt-lg-5" md="5">
            <Card className="card-stats bg-default">
              <CardBody>
                <Row>
                  <Col md="4" xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="tim-icons icon-wallet-43 text-success" />
                    </div>
                  </Col>
                  <Col md="8" xs="7">
                    <div className="numbers">
                      <CardTitle tag="p">{totalStats.totalCount?.txns}</CardTitle>
                      <p />
                      <p className="card-category">Transactions</p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col md="12">
            <Card className="card-chart card-plain">
              <CardHeader>
                <Row>
                  <Col className="text-left" sm="6">
                    <hr className="line-info" />
                    <CardTitle tag="h2">Total transactions</CardTitle>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    id="total-txns"
                    data={GraphSetup.data(TransactionCount.totalTxns? TransactionCount.totalTxns: TransactionCount)}
                    options={GraphSetup.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
export default Dashboard;
