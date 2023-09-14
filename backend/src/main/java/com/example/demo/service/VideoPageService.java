package com.example.demo.service;

import com.example.demo.exception.FileStorageException;
import com.example.demo.exception.MyFileNotFoundException;
import com.example.demo.model.req.editVideoRequest;
import com.example.demo.property.VideoPageProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

@Service
public class VideoPageService {

    public Integer storeVideo(MultipartFile file, String id) {
        // Normalize file name
        Path fileStorageLocation = Paths.get("temp/"+id+"/")
                .toAbsolutePath().normalize();
        System.out.print(fileStorageLocation);

        try {
            Files.createDirectories(fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }

        String fileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Check if the file's name contains invalid characters
            if(fileName.contains("..")) {
                throw new FileStorageException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = fileStorageLocation.resolve(fileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return Integer.valueOf(id);
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public int editVideo(editVideoRequest request) throws IOException {
        int start_time = request.getStart_time();
        int end_time = request.getEnd_time();
        Path currentRelativePath = Paths.get("");
        String s = currentRelativePath.toAbsolutePath().toString();

        File folder = new File(s+"/temp/"+request.getFolder_id());
        File[] listOfFiles = folder.listFiles();
        String filename = listOfFiles[0].getName();

        try{
            Process p = Runtime.getRuntime().exec(new String[]{"python3",
                    s+"/script/cut_video.py",
                    s+"/temp/"+request.getFolder_id()+"/" +filename,
                    Integer.toString(start_time),
                    Integer.toString(end_time),
                    s+"/temp/"+request.getFolder_id()+"/step_1_result.mp4"
            });

            BufferedReader stdInput = new BufferedReader(new
                    InputStreamReader(p.getInputStream()));

            BufferedReader stdError = new BufferedReader(new
                    InputStreamReader(p.getErrorStream()));

            // read the output from the command
            System.out.println("Here is the standard output of the command:\n");
            String s_output;
            while ((s_output = stdInput.readLine()) != null) {
                System.out.println(s_output);
            }

            // read any errors from the attempted command
            boolean error = false;
            System.out.println("Here is the standard error of the command (if any):\n");
            while ((s_output = stdError.readLine()) != null) {
                System.out.println(s_output);
                if (s.contains("Error")){
                    error = true;
                }
            }
            if (error){
                return -1;
            }

            return 0;
        }catch(Exception e) {
            System.out.println("Exception Raised" + e.toString());
            return -1;
        }
    }
}