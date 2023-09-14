package com.example.demo.controller;

import com.example.demo.model.req.confirmSelectRequest;
import com.example.demo.model.req.modelFrameRequest;
import com.example.demo.model.req.modelJointsRequest;
import com.example.demo.model.req.modelPointsRequest;
import com.example.demo.model.resp.*;
import com.example.demo.service.SelectPageService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin
public class SelectPageController {

    @Autowired
    private SelectPageService selectPageService;

    @PostMapping("/modelPoints")
    public ModelPointsResponse modelPoints(@RequestBody modelPointsRequest request) throws IOException {
        List<Double> data = selectPageService.getModelPoints(request);
        int frame = request.getN_frame();
        return new ModelPointsResponse(data, frame);
    }
    @PostMapping("/modelJoints")
    public ModelJointsResponse modelJoints(@RequestBody modelJointsRequest request) throws IOException {
        List<Double> data = selectPageService.getModelJoints(request);
        int frame = request.getN_frame();
        return new ModelJointsResponse(data, frame);
    }
    @GetMapping("/modelFaces")
    public ModelFacesResponse modelFaces() throws FileNotFoundException {
        List<List<Integer>> data = selectPageService.getModelFaces();
        return new ModelFacesResponse(data);
    }
    @PostMapping("/modelFrame")
    public ModelFrameResponse modelFrame(@RequestBody modelFrameRequest request) throws IOException {
        Integer data = selectPageService.getModelFrame(request);
        return new ModelFrameResponse(data);
    }
    @PostMapping("/confirmSelect")
    public ConfirmSelectResponse confirmSelect(@RequestBody confirmSelectRequest request) throws IOException {
        String data = selectPageService.confirmSelect(request);
        return new ConfirmSelectResponse(data);
    }


}
