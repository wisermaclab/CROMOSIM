package com.example.demo.controller;

import com.example.demo.common.Response;
import com.example.demo.model.req.editVideoRequest;
import com.example.demo.model.resp.UploadVideoResponse;
import com.example.demo.service.VideoPageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@CrossOrigin
public class VideoPageController {

    private static final Logger logger = LoggerFactory.getLogger(VideoPageController.class);

    @Autowired
    private VideoPageService videoPageService;

    @PostMapping(value="/uploadVideo",produces=MediaType.APPLICATION_JSON_VALUE)
    public UploadVideoResponse uploadVideo(@RequestParam("file") MultipartFile file, @RequestParam("id") String id) {
        Integer foldId = videoPageService.storeVideo(file,id);

        return new UploadVideoResponse(foldId, file.getContentType(), file.getSize());
    }

    @PostMapping("/editVideo")
    public Response<String> editVideo(@RequestBody editVideoRequest request) throws IOException {
        int result = videoPageService.editVideo(request);
        if (result == 0){
            return new Response<>("success");
        }
        return new Response<>("failed");
    }

}
