package com.example.demo.controller;

import com.example.demo.common.Response;
import com.example.demo.model.req.deleteFileRequest;
import com.example.demo.model.req.editVideoRequest;
import com.example.demo.model.req.processFileRequest;
import com.example.demo.model.resp.UploadFileResponse;
import com.example.demo.service.ModelPageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;

@RestController
@CrossOrigin
public class ModelPageController {

    @Autowired
    private ModelPageService modelPageService;

    @PostMapping(value="/uploadResult",produces= MediaType.APPLICATION_JSON_VALUE)
    public UploadFileResponse uploadResult(@RequestParam("file") MultipartFile file, @RequestParam("id") String id) {
        String fileName = modelPageService.storeResult(file, id);

        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/downloadFile/")
                .path(fileName)
                .toUriString();

        return new UploadFileResponse(fileName, fileDownloadUri,
                file.getContentType(), file.getSize());
    }

    @PostMapping("/deleteFile")
    public Response<String> deleteFile(@RequestBody deleteFileRequest request){
        boolean result = modelPageService.deleteFile(request);
        if (result){
            return new Response<>("success");
        }
        return new Response<>("failed");
    }

    @GetMapping("/fileNumber_{id}")
    public Integer getFileNumber(@PathVariable Integer id){
        return modelPageService.getFileNumber(id);
    }

    @PostMapping("/cvdProcess")
    public Response<String> cvdProcess(@RequestBody processFileRequest request){
        int result = modelPageService.cvd_process(request);
        System.out.print(result);
        if (result == 0){
            return new Response<>("success");
        }
        return new Response<>("failed");
    }

    @PostMapping("/vibeCmd")
    public Response<String> vibeCmd(@RequestBody processFileRequest request){
        int result = modelPageService.vibe_cmd(request);
        if (result == 0){
            return new Response<>("success");
        }
        return new Response<>("failed");
    }

    @PostMapping("/vibeProcess")
    public Response<String> vibeProcess(@RequestBody processFileRequest request){
        int result = modelPageService.vibe_process(request);
        if (result == 0){
            return new Response<>("success");
        }
        return new Response<>("failed");
    }
}
