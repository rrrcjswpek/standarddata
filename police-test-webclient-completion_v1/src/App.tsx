import "./App.css";
import { Alert, Button } from "reactstrap";
import { Form } from "reactstrap";
import { FormGroup } from "reactstrap";
import { Label } from "reactstrap";
import { Input } from "reactstrap";
import { Container } from "reactstrap";
import { Row } from "reactstrap";
import { Col } from "reactstrap";
import Chatting from "./components/Chatting";
import TextInputBox from "./components/TextInputBox";
import { useState } from "react";
let reqMsg: string | undefined;

function App() {
  const [testState, setTestState] = useState(false);
  const [logMsg, setLogMsg] = useState("");

  function updateState(state: boolean) {
    setTestState(state);
  }
  function updateLogMsg(log: string) {
    setLogMsg(log);
  }
  function updateReqMsg(msg: string) {
    console.log("App reqmsg : ", msg);
    reqMsg = msg;
  }
  return (
    <div className="App">
      <Container fluid>
        <Row>
          <Col className="bg-light border" xs="12">
            <h3>
              경찰청 교통 신호 제어기 표준 규격 - 교차로 제어/상황 정보 시험
            </h3>
          </Col>
        </Row>
        <Row>
          <Col className="bg-light border p-2" xs="6">
            {/* <Form className="bg-light border"></Form> */}
            <Form className="bg-light border" style={{ height: 600 }}>
              <header>세션 설정(TCP)</header>
              <TextInputBox
                updateReqMsg={updateReqMsg}
                updateLogMsg={updateLogMsg}
                testState={testState}
                updateState={updateState}
              />
            </Form>
            {/* <Form className="bg-light border p-2 ">
              <header>시험 정보 불러오기</header>
              <Filesend />
            </Form> */}
          </Col>
          <Col className="bg-light border" xs="6">
            <Chatting
              reqMsg={reqMsg}
              logMsg={logMsg}
              testState={testState}
              updateState={updateState}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
