import React, { useState, useContext, useEffect } from "react";
import { WebSocketContext } from "../websocket/WebSocketProvider";
import { Button } from "reactstrap";
import { FormGroup } from "reactstrap";
import { Label } from "reactstrap";
import { Input } from "reactstrap";
import { Col } from "reactstrap";
import { Row } from "reactstrap";
function TextInputBox() {
  const [message3, setMessage3] = useState("");
  const ws = useContext(WebSocketContext);

  const handleChangeText3 = (e: any) => {
    setMessage3(e.target.value);
  };
  const str = "single.json";
  const str2 = "dual.json";
  const handleClickSubmit2 = () => {
    console.log(message3.match(str));
    if (message3.match(str)) {
      ws.current.send(
        JSON.stringify({
          request_id: "18421",
          context: {
            ctrl_req: {
              cross_id: "83",
              command: {
                single: {
                  lc_fixed: "SetPhase5",
                },
              },
            },
          },
        })
      );
    } else if (message3.match(str2)) {
      ws.current.send(
        JSON.stringify({
          request_id: "18421",
          context: {
            ctrl_req: {
              cross_id: "83",
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
        })
      );
    }
    setMessage3("");
  };

  return (
    <div>
      <FormGroup
        row
        className=" align-items-center"
        p-2
        style={{ height: 180 }}
      >
        <Row xs="4">
          <Col xs="12">
            <Label for="exampleFile" sm={4}></Label>
            <Input
              id="exampleFile"
              name="file"
              type="file"
              value={message3}
              onChange={handleChangeText3}
            />
          </Col>
        </Row>
        <Row xs="4">
          <Col xs="12">
            <Button size="sm" type="button" onClick={handleClickSubmit2}>
              파일 전송
            </Button>
          </Col>
        </Row>
      </FormGroup>
    </div>
  );
}

export default TextInputBox;
