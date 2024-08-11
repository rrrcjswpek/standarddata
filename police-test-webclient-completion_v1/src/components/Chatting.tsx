import React, { useContext, useState, useEffect } from "react";
import { WebSocketContext } from "../websocket/WebSocketProvider";
import { Alert, FormGroup } from "reactstrap";
import { Label } from "reactstrap";
import { Input } from "reactstrap";
import { Col } from "reactstrap";
import { Form } from "reactstrap";
import { Card, CardHeader, CardBody } from "reactstrap";
import { P } from "ts-pattern";
import { string } from "ts-pattern/dist/patterns";
import { buffer } from "node:stream/consumers";

interface propsType {
  reqMsg: string | undefined;
  logMsg: string;
  testState: boolean;
  updateState: (state: boolean) => void;
}

let buf: string | undefined;
let reqMsg;

function Chatting(props: propsType) {
  const ws = useContext(WebSocketContext);
  const [items, setItems] = useState<string[]>([]);
  const [agentState, setAgentState] = useState(false);
  const [sessionState, setSessionState] = useState(false);
  const [testState, setTestState] = useState(false);
  const [testResult, setTestResult] = useState("unknown");

  useEffect(() => {
    setTestState(props.testState);
  }, [props.testState]);

  useEffect(() => {
    if (props.logMsg !== "") {
      if (!testState) {
        buf = props.logMsg;
      } else {
        addLog(props.logMsg);
      }
    }
  }, [props.logMsg]);

  useEffect(() => {
    // props.updateState(testState);
    if (testState) {
      let temp = ["시험을 시작합니다."];
      //addLog("시험을 시작합니다.");
      if (buf !== undefined) {
        //addLog(buf);

        // iface
        buf = ">>> 접속 정보 전송  ";
        temp.push(buf);
        buf = props.logMsg;
        temp.push(buf);
        temp.push("");
        buf = undefined;
      }
      addLog(...temp);
    } else if (testState === false && testResult !== "unknown") {
      addLog("시험이 종료되었습니다.");
    }
  }, [testState]);

  // WS Connect and Set Type:Cilent(Web)
  const client = "web";
  ws.current.onopen = () => {
    ws.current.send(
      JSON.stringify({
        type: client,
      })
    );
  };
  // WS Connect and Set Type:Cilent(Web)

  // Handle log : rcv log msg and add to Progress
  // const addItem = (item: string) => {
  //   console.log("aaa", [...items, item]);
  //   setItems([...items, item]);
  //   //setItems(item);
  // };
  const addItem = (...item: string[]) => {
    console.log("aaa", [...items, ...item]);
    setItems([...items, ...item]);
    //setItems(item);
  };
  function addLog(...log: string[]) {
    console.log("add log: ", ...log);
    if (log !== undefined) {
      addItem(...log);
    }
  }
  // function addLog(log: string | undefined) {
  //   console.log("add log: ", log);
  //   if (log !== undefined) {
  //     addItem(log);
  //   }
  // }

  // Handle Agent State : rcv Ready Msg
  function handleAgentState(str: string) {
    setAgentState(str === "Traffic Light Checker Ready" ? true : false);
    addLog("=== Agent 연동 완료 ===");
  }

  // Handle Interface State : rcv reply-Iface_cnf - session state + state state
  function handleIfaceState(state: boolean) {
    //setSessionState(state === true ? true : false);
    if (buf !== undefined) {
      let test = ["<<< 접속 정보 확인"];
      test.push(buf);
      addLog(...test);
      buf = undefined;
    }
    //setTestState(state === true ? true : false);
  }

  function handleTestResult(result: boolean) {
    if (result === true) {
      setTestResult("SUCCESS");
      ws.current.send(
        JSON.stringify({
          notify: {
            web: "Test Finish",
          },
        })
      );
    } else if (result === false) {
      setTestResult("FAILURE");
    }
    if (buf !== undefined) {
      addLog(buf);
      buf = undefined;
    }
  }

  function handleClientConnect(str: string) {
    if (str === "Client connected") {
      setSessionState(true);
      reqMsg = props.reqMsg;
      console.log("send req msg :", reqMsg);
      if (reqMsg !== undefined) {
        ws.current.send(reqMsg);
        if (buf) {
          let test: string[] = [...buf.split("_gitsn"), ">>> 요청 정보 전송"];
          test.push(reqMsg);
          addLog(...test);
          buf = undefined;
        }
      }
    }
  }
  function handleTerminate() {
    setTestState(false);
    setSessionState(false);
    setAgentState(false);
  }

  ws.current.onmessage = (evt: MessageEvent) => {
    const rcv = JSON.parse(evt.data);
    //addItem(rcv.data);
    const key = Object.keys(rcv)[0];

    const stringValue = JSON.stringify(rcv, null, 4);

    switch (key) {
      case "ready":
        break;
      case "reply":
        buf = "<<< 정보 수신" + stringValue;
        break;
      case "notify":
        buf = "<<< notify 수신_gitsn" + stringValue;
        break;
    }

    addLog(stringValue);

    switch (key) {
      case "ready":
        handleAgentState(rcv.ready.str);
        break;
      case "reply":
        const replyKey = Object.keys(rcv.reply.context)[0];
        const context = rcv.reply.context[Object.keys(rcv.reply.context)[0]];
        const replyResult = context.success;
        switch (replyKey) {
          case "iface_cnf":
            handleIfaceState(replyResult);
            break;
          case "ctrl_rsp":
          case "status_rsp":
            handleTestResult(replyResult);
            break;
        }
        console.log(rcv.reply.context[Object.keys(rcv.reply.context)[0]]);
        break;
      case "notify":
        const notifyKey = Object.keys(rcv.notify)[0];
        const notifyValue = rcv.notify[Object.keys(rcv.notify)[0]];
        console.log("notify Key ", notifyKey);
        console.log("notify Value : ", notifyValue);
        switch (notifyKey) {
          case "error":
            break;
          case "notify":
            handleClientConnect(notifyValue);
            break;
          case "warning":
            break;
          case "terminate":
            handleTerminate();
            //setItems([]);
            break;
        }
        break;
    }
  };
  return (
    <div>
      <Form className="bg-light border m-2 p-2">
        <header>상태</header>
        <FormGroup row className="row-cols-lg-auto align-items-center">
          <Label for="t_session" sm={2}>
            Agent 연동 상태:
          </Label>
          <Col sm={10}>
            <li>{agentState ? "Agent 연동 중" : "Agent 연동 X"}</li>
          </Col>
          <Label for="session" sm={2}>
            세션 연결 상태:
          </Label>
          <Col sm={10}>
            <li>{sessionState ? "연결 중" : "연결 X"}</li>
          </Col>
          <Label for="t_session" sm={2}>
            시험 상태:
          </Label>
          <Col sm={10}></Col>
          <li>{testState ? "시험중" : "-"}</li>
        </FormGroup>
      </Form>
      <Form>
        <FormGroup>
          <Card>
            <CardHeader>시험 진행 상황</CardHeader>
            <CardBody style={{ height: 350 }}>
              <div
                style={{
                  maxHeight: "330px",
                  overflowY: "auto",
                  textAlign: "left",
                }}
              >
                {items.map((item) => (
                  <pre key={item}>{item}</pre>
                ))}
              </div>
            </CardBody>
          </Card>
        </FormGroup>
        <FormGroup>
          <Card>
            <CardHeader>시험 결과</CardHeader>
            <CardBody>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <pre>{`시험 결과 : ${testResult}`}</pre>
              </div>
            </CardBody>
          </Card>
        </FormGroup>
      </Form>
    </div>
  );
}

export default Chatting;
