package com.example.demo.service;

import com.example.demo.exception.FileStorageException;
import com.example.demo.model.req.deleteFileRequest;
import com.example.demo.model.req.editVideoRequest;
import com.example.demo.model.req.processFileRequest;
import com.example.demo.property.ModelPageProperties;
import com.example.demo.property.VideoPageProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ModelPageService {

    public String storeResult(MultipartFile file, String id) {
        // Normalize file name

        Path fileStorageLocation = Paths.get("temp/"+id+"/")
                .toAbsolutePath().normalize();

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
            System.out.print(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public boolean deleteFile(deleteFileRequest request) {
        Path fileStorageLocation = Paths.get("temp/"+request.getFolder_id()+"/")
                .toAbsolutePath().normalize();

        String file_path = fileStorageLocation + "/" + request.getFile_name();
        System.out.print(file_path);
        File file = new File(file_path);
        if (file.delete()) {
            return true;
        }
        else {
            return false;
        }
    }

    public int cvd_process(processFileRequest request) {
        Path currentRelativePath = Paths.get("");
        String currentPath = currentRelativePath.toAbsolutePath().toString();

        File folder = new File(currentPath+"/temp/"+request.getFolder_id());
        File[] listOfFiles = folder.listFiles();
        if (listOfFiles.length < 5){
            return -1;
        }

        try{
            Process p = Runtime.getRuntime().exec(new String[]{"python3",
                    currentPath+"/script/cvd_process.py",
                    String.valueOf(request.getFolder_id())
            });

            BufferedReader stdInput = new BufferedReader(new
                    InputStreamReader(p.getInputStream()));

            BufferedReader stdError = new BufferedReader(new
                    InputStreamReader(p.getErrorStream()));

            // read the output from the command
            System.out.println("Here is the standard output of the command:\n");
            String s;
            while ((s = stdInput.readLine()) != null) {
                System.out.println(s);
            }
            // read any errors from the attempted command
            boolean error = false;
            System.out.println("Here is the standard error of the command (if any):\n");
            while ((s = stdError.readLine()) != null) {
                System.out.println(s);
                if (s.contains("Error:")){
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

    public int vibe_cmd(processFileRequest request) {
        Path currentRelativePath = Paths.get("");
        String currentPath = currentRelativePath.toAbsolutePath().toString();

        try{
            Process p = Runtime.getRuntime().exec(new String[]{"python3",
                    currentPath+"/script/vibe_cmd.py",
                    String.valueOf(request.getFolder_id())
            });

            BufferedReader stdInput = new BufferedReader(new
                    InputStreamReader(p.getInputStream()));

            BufferedReader stdError = new BufferedReader(new
                    InputStreamReader(p.getErrorStream()));

            // read the output from the command
            System.out.println("Here is the standard output of the command:\n");
            String s;
            while ((s = stdInput.readLine()) != null) {
                System.out.println(s);
            }

            // read any errors from the attempted command
            boolean error = false;
            System.out.println("Here is the standard error of the command (if any):\n");
            while ((s = stdError.readLine()) != null) {
                System.out.println(s);
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

    public int vibe_process(processFileRequest request) {
        Path currentRelativePath = Paths.get("");
        String currentPath = currentRelativePath.toAbsolutePath().toString();

        try{
            Process p = Runtime.getRuntime().exec(new String[]{"python3",
                    currentPath+"/script/vibe_process.py",
                    String.valueOf(request.getFolder_id())
            });

            BufferedReader stdInput = new BufferedReader(new
                    InputStreamReader(p.getInputStream()));

            BufferedReader stdError = new BufferedReader(new
                    InputStreamReader(p.getErrorStream()));

            // read the output from the command
            System.out.println("Here is the standard output of the command:\n");
            String s;
            while ((s = stdInput.readLine()) != null) {
                System.out.println(s);
            }

            // read any errors from the attempted command
            boolean error = false;
            System.out.println("Here is the standard error of the command (if any):\n");
            while ((s = stdError.readLine()) != null) {
                System.out.println(s);
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

    public Integer getFileNumber(Integer id) {
        Path currentRelativePath = Paths.get("");
        String currentPath = currentRelativePath.toAbsolutePath().toString();

        File folder = new File(currentPath+"/temp/"+id);
        File[] listOfFiles = folder.listFiles();
        while (listOfFiles.length != 5){
            folder = new File(currentPath+"/temp/"+id);
            listOfFiles = folder.listFiles();
        }
        return 1;
    }
}
