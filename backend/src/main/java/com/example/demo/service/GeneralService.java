package com.example.demo.service;

import com.example.demo.model.req.endRequest;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;

@Service
public class GeneralService {

    public void end_process(endRequest request) throws IOException {

        File file = new File("temp/"+request.getFolder_id()+"/");
        FileUtils.deleteDirectory(file);
    }

}
