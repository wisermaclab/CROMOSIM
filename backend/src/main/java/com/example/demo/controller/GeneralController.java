package com.example.demo.controller;

import com.example.demo.common.Response;
import com.example.demo.model.req.deleteFileRequest;
import com.example.demo.model.req.endRequest;
import com.example.demo.model.req.processFileRequest;
import com.example.demo.model.resp.UploadFileResponse;
import com.example.demo.service.GeneralService;
import com.example.demo.service.ModelPageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;

@RestController
@CrossOrigin
public class GeneralController {

    @Autowired
    private GeneralService generalService;

    @PostMapping("/endProcess")
    public Response<String> endProcess(@RequestBody endRequest request) throws IOException {
        generalService.end_process(request);
        System.out.print(request.getFolder_id());
        return new Response<>("success");
    }
}
