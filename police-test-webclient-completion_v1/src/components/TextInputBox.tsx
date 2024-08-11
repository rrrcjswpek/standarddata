import React, { useState, useContext, useEffect, useRef } from "react";
import { WebSocketContext } from "../websocket/WebSocketProvider";
import { Button } from "reactstrap";
import { FormGroup } from "reactstrap";
import { Label } from "reactstrap";
import { Input } from "reactstrap";
import { Col } from "reactstrap";
import { Form } from "reactstrap";

// Request Msg
const ctrlSingleMsg = JSON.stringify({
  request_id: 18421,
  context: {
    ctrl_req: {
      cross_id: 0,
      command: {
        single: {
          lc_fixed: "SetPhase5",
        },
      },
    },
  },
}, null, 4);
const ctrlDualMsg = JSON.stringify({
  request_id: 18421,
  context: {
    ctrl_req: {
      cross_id: 0,
      command: {
        dual: {
          rc_actuation: {
            ring_b: "EndPhease3",
            ring_a: "EndPhease6",
          },
        },
      },
    },
  },
}, null, 4);

const statusMsg = JSON.stringify({
  request_id: 18421,
  context: {
    status_req: {
      cross_id: 0,
    },
  },
}, null, 4);
// Request Msg

interface propsType {
  testState: boolean;
  updateState: (state: boolean) => void;
  updateLogMsg: (log: string) => void;
  updateReqMsg: (msg: string) => void;
}

let buf: string | undefined;

function TextInputBox(props: propsType) {
  const [message, setMessage] = useState(0);
  const [message1, setMessage1] = useState(0);
  const [message2, setMessage2] = useState(0);
  const [testState, setTestState] = useState(false);
  const [fileName, setFileName] = useState("");
  const [reqMsg, setReqMsg] = useState("");

  const ws = useContext(WebSocketContext);
  const refClientMax = useRef<HTMLInputElement>(null);
  const refClientIdleTime = useRef<HTMLInputElement>(null);
  const refListenPort = useRef<HTMLInputElement>(null);
  const refFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTestState(props.testState);
  }, [props.testState]);

  useEffect(() => {
    if (testState) {
      // console.log("send req msg :", reqMsg);
      // ws.current.send(reqMsg);
      // props.updateLogMsg(reqMsg);
      disableControl();
    } else {
      enableControl();
    }
  }, [testState]);

  const handleChangeText = (e: any) => {
    const clientMax = Number(e.target.value);
    setMessage(clientMax);
  };
  const handleChangeText1 = (e: any) => {
    const clientIdleTimeS = Number(e.target.value);
    setMessage1(clientIdleTimeS);
  };
  const handleChangeText2 = (e: any) => {
    const listenPort = Number(e.target.value);
    setMessage2(listenPort);
  };

  function disableControl() {
    if (refClientMax.current !== null) {
      refClientMax.current.disabled = true;
      refClientMax.current.focus();
    }
    if (refClientIdleTime.current !== null) {
      refClientIdleTime.current.disabled = true;
      refClientIdleTime.current.focus();
    }
    if (refListenPort.current !== null) {
      refListenPort.current.disabled = true;
      refListenPort.current.focus();
    }
    if (refFile.current !== null) {
      refFile.current.disabled = true;
      refFile.current.focus();
    }
  }

  function enableControl() {
    if (refClientMax.current !== null) {
      refClientMax.current.disabled = false;
      refClientMax.current.focus();
    }
    if (refClientIdleTime.current !== null) {
      refClientIdleTime.current.disabled = false;
      refClientIdleTime.current.focus();
    }
    if (refListenPort.current !== null) {
      refListenPort.current.disabled = false;
      refListenPort.current.focus();
    }
    if (refFile.current !== null) {
      refFile.current.disabled = false;
      refFile.current.focus();
    }
  }

  const handleClickSubmit = () => {
    const ifaceMsg = JSON.stringify({
      request_id: 17421,
      context: {
        iface_cfg: {
          client_max: message,
          client_idletime_s: message1,
          listen_port: message2,
        },
      },
    }, null, 4);

    if (!testState) {
      // 시험 시작 요청
      disableControl();
      props.updateState(true);
      console.log("send iface msg : ", ifaceMsg);
      ws.current.send(ifaceMsg);
      props.updateLogMsg(ifaceMsg);
      props.updateReqMsg(reqMsg);
      console.log("updatereqmsg: ", reqMsg);
    } else {
      // 시험 중단 요청 (example msg)
      enableControl();
      ws.current.send(
        JSON.stringify({
          cmd: "Test Stop",
        })
      );
    }
  };

  const onClear = () => {
    setMessage(0);
    setMessage1(0);
    setMessage2(0);
  };

  const handleChangeFileName = (e: any) => {
    setFileName(e.target.value);
  };

  // set Req Data
  useEffect(() => {
    const fnSingle = "single.json";
    const fnDual = "dual.json";
    const fnStatus = "status.json";
    if (fileName.match(fnSingle)) {
      setReqMsg(ctrlSingleMsg);
    } else if (fileName.match(fnDual)) {
      setReqMsg(ctrlDualMsg);
    } else if (fileName.match(fnStatus)) {
      setReqMsg(statusMsg);
    } else {
    }
  }, [fileName]);
  // set Req Data

  return (
    <div>
      <FormGroup
        row
        className="row-cols-lg-auto align-items-center p-2 m-2"
        style={{ height: 100 }}
      >
        <Label for="exampleSelectMulti" sm={2}>
          연결 방식:
        </Label>
        <Col sm={10}>
          <Input id="exampleSelectMulti" name="select" type="select" disabled>
            <option>Passive</option>
            <option>Active</option>
          </Input>
        </Col>
        <Col sm="4">
          <Button size="sm" type="reset" onClick={onClear}>
            설정 초기화
          </Button>{" "}
        </Col>
        <Col sm="4">
          <Button size="sm" type="button" onClick={handleClickSubmit}>
            {testState ? "시험 중단" : "시험 시작"}
          </Button>{" "}
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="client_max" sm={3}>
          시험 대상 단말 수:
        </Label>
        <Col sm={3}>
          <input
            id="client_max"
            type="text"
            value={message}
            onChange={handleChangeText}
            ref={refClientMax}
          />
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="client_idle" sm={3}>
          시험 응답 유효 시간:
        </Label>
        <Col sm={3}>
          <input
            id="client_idle"
            type="text"
            value={message1}
            onChange={handleChangeText1}
            ref={refClientIdleTime}
          />
        </Col>
      </FormGroup>
      <FormGroup row>
        <Label for="listen_port" sm={3}>
          포트 번호:
        </Label>
        <Col sm={3}>
          <input
            id="listen_port"
            type="text"
            value={message2}
            onChange={handleChangeText2}
            ref={refListenPort}
          />
        </Col>{" "}
      </FormGroup>
      <Form className="bg-light border p-2" style={{ height: 290}}>
        <FormGroup row style={{ height: 180 }}>
          <header>시험 정보 불러오기</header>
          <Label for="exampleFile" sm={0}></Label>
          <Col sm={10}>
            <Input
              id="exampleFile"
              name="file"
              type="file"
              value={fileName}
              onChange={handleChangeFileName}
            />
          </Col>
        </FormGroup>
      </Form>
    </div>
  );
}

export default TextInputBox;
