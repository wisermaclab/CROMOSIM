package com.example.demo.service;

import com.example.demo.model.req.confirmSelectRequest;
import com.example.demo.model.req.modelFrameRequest;
import com.example.demo.model.req.modelJointsRequest;
import com.example.demo.model.req.modelPointsRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

@Service
public class SelectPageService {
    List<List<Integer>> faces = new ArrayList<>();

    @Autowired
    public SelectPageService() throws FileNotFoundException {
        Path currentRelativePath = Paths.get("");
        String s = currentRelativePath.toAbsolutePath().toString();

        File myObj = new File(s+"/models/face/face.txt");
        Scanner myReader = new Scanner(myObj);
        while (myReader.hasNextLine()) {
            String data = myReader.nextLine();
            String face[] = data.split(" ");
            List<Integer> tmpList = new ArrayList<>();
            for (String point : face) {
                tmpList.add(Integer.valueOf(point));
            }
            faces.add(tmpList);
        }
        myReader.close();
    }

    public List<Double> getModelPoints(modelPointsRequest request) throws IOException {
        List<List<Double>> points = new ArrayList<>();
        List<Double> result = new ArrayList<>();

        int nframe = request.getN_frame();

        Path currentRelativePath = Paths.get("");
        String s = currentRelativePath.toAbsolutePath().toString();

        File myObj_traj = new File(s+"/temp/"+request.getFolder_id()+"/traj.txt");
        Scanner myReader_traj = new Scanner(myObj_traj);
        int id = 0;
        Path path = Paths.get(s+"/temp/"+request.getFolder_id()+"/traj.txt");
        int t_result = Math.toIntExact(Files.lines(path).count());
        String center[] = new String[t_result];

        while (myReader_traj.hasNextLine()) {
            String data = myReader_traj.nextLine();
            if (id == nframe){
                center = data.split(" ");
                break;
            }
            id += 1;
        }
        myReader_traj.close();

        File myObj = new File(s+"/temp/"+request.getFolder_id()+"/VIBE_result/verts/tri_coords_frame" + nframe + ".txt");
        Scanner myReader = new Scanner(myObj);
        while (myReader.hasNextLine()) {
            String data = myReader.nextLine();
            String face[] = data.split(" ");
            List<Double> tmpList = new ArrayList<>();
            tmpList.add(-Double.valueOf(face[0])-Double.valueOf(center[0])*10);
            tmpList.add(Double.valueOf(face[1])+Double.valueOf(center[1])*10);
            tmpList.add(Double.valueOf(face[2])+Double.valueOf(center[2])*10);
            points.add(tmpList);
        }
        myReader.close();

        for (int i = 0; i < faces.size(); i++){
            result.add(points.get(faces.get(i).get(0)).get(0));
            result.add(points.get(faces.get(i).get(0)).get(2));
            result.add(points.get(faces.get(i).get(0)).get(1));
            result.add(points.get(faces.get(i).get(1)).get(0));
            result.add(points.get(faces.get(i).get(1)).get(2));
            result.add(points.get(faces.get(i).get(1)).get(1));
            result.add(points.get(faces.get(i).get(2)).get(0));
            result.add(points.get(faces.get(i).get(2)).get(2));
            result.add(points.get(faces.get(i).get(2)).get(1));
        }

        return result;
    }

    public List<Double> getModelJoints(modelJointsRequest request) throws IOException {
        List<Double> result = new ArrayList<>();

        int nframe = request.getN_frame();

        Path currentRelativePath = Paths.get("");
        String s = currentRelativePath.toAbsolutePath().toString();

        File myObj_traj = new File(s+"/temp/"+request.getFolder_id()+"/traj.txt");
        Scanner myReader_traj = new Scanner(myObj_traj);
        int id = 0;
        Path path = Paths.get(s+"/temp/"+request.getFolder_id()+"/traj.txt");
        int t_result = Math.toIntExact(Files.lines(path).count());
        String center[] = new String[t_result];

        while (myReader_traj.hasNextLine()) {
            String data = myReader_traj.nextLine();
            if (id == nframe){
                center = data.split(" ");
                break;
            }
            id += 1;
        }
        myReader_traj.close();

        File myObj = new File(s+"/temp/"+request.getFolder_id()+"/VIBE_result/joints/joint_coords_frame" + nframe + ".txt");
        Scanner myReader = new Scanner(myObj);
        while (myReader.hasNextLine()) {
            String data = myReader.nextLine();
            String face[] = data.split(" ");
            result.add(-Double.valueOf(face[0])-Double.valueOf(center[0])*10);
            result.add(Double.valueOf(face[2])+Double.valueOf(center[2])*10);
            result.add(Double.valueOf(face[1])+Double.valueOf(center[1])*10);
        }
        myReader.close();

        return result;
    }

    public List<List<Integer>> getModelFaces() throws FileNotFoundException {
        List<List<Integer>> result = new ArrayList<>();

        Path currentRelativePath = Paths.get("");
        String s = currentRelativePath.toAbsolutePath().toString();

        File myObj = new File(s+"/models/face/face.txt");
        Scanner myReader = new Scanner(myObj);
        while (myReader.hasNextLine()) {
            String data = myReader.nextLine();
            String face[] = data.split(" ");
            List<Integer> tmpList = new ArrayList<>();
            for (String point : face) {
                tmpList.add(Integer.valueOf(point));
            }
            result.add(tmpList);
        }
        myReader.close();

        return result;
    }

    public Integer getModelFrame(modelFrameRequest request) throws IOException {
        int result = 0;
        Path currentRelativePath = Paths.get("");
        String s = currentRelativePath.toAbsolutePath().toString();

        int v_result = new File(s+"/temp/"+request.getFolder_id()+"/VIBE_result/verts").list().length;

        int c_result = new File(s+"/temp/"+request.getFolder_id()+"/CVD_result/content/family_run_output/camera_params").list().length;

        Path path = Paths.get(s+"/temp/"+request.getFolder_id()+"/traj.txt");
        int t_result = Math.toIntExact(Files.lines(path).count());

        result = Math.min(v_result, Math.min(c_result, t_result));

        return result;
    }

    public String confirmSelect(confirmSelectRequest request) throws IOException {
        Path currentRelativePath = Paths.get("");
        String currentPath = currentRelativePath.toAbsolutePath().toString();
        String c = currentRelativePath.toAbsolutePath().toString();
        String tmp_filename = c+"/temp/"+request.getFolder_id()+"/selected_v.txt";
        BufferedWriter writer = new BufferedWriter(new FileWriter(tmp_filename));
        writer.write(request.getSelected_list());
        writer.close();
        System.out.print(tmp_filename);

        try{
            Process p = Runtime.getRuntime().exec(new String[]{"python3",
                    currentPath+"/script/simulate.py",
                    String.valueOf(request.getFolder_id()),
                    String.valueOf(tmp_filename)
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
                return "error";
            }

            String result_file = c+"/temp/"+request.getFolder_id()+"/acc_result.txt";
            Path path = Paths.get(result_file);
            long lines = 0;
            try {

                // much slower, this task better with sequence access
                //lines = Files.lines(path).parallel().count();

                lines = Files.lines(path).count();

            } catch (IOException e) {
                e.printStackTrace();
            }
            File myObj = new File(result_file);
            Scanner myReader = new Scanner(myObj);

            String result_file_gyro = c+"/temp/"+request.getFolder_id()+"/gyro_result.txt";
            File myObj_gyro = new File(result_file_gyro);
            Scanner myReader_gyro = new Scanner(myObj_gyro);

            String result_string = "frame#,time,x_acceleration,y_acceleration,z_acceleration,x_angle_rate,y_angle_rate,z_angle_rate\n";
            int count = 0;

            String duration_filename = c+"/temp/"+request.getFolder_id()+"/video_length.txt";
            Float dur_tmp = (float)0.0;
            File lengthFile = new File(duration_filename);
            Scanner lengthReader = new Scanner(lengthFile);
            String length_data = lengthReader.nextLine();
            System.out.println(length_data);
            dur_tmp = Float.parseFloat(length_data);

            System.out.println(dur_tmp);//

            while (myReader.hasNextLine()) {
                String data = myReader.nextLine();
                data = data.replace(" ", ",");
                System.out.println(data);

                String data_g = myReader_gyro.nextLine();
                data_g = data_g.replace(" ", ",");
                System.out.println(data_g);

                result_string = result_string + count + "," + (float)(dur_tmp*count/lines) + "," + data  + "," + data_g + "\n";
                count++;

            }
            lengthReader.close();
            myReader.close();
            myReader_gyro.close();

            return result_string;
        }catch(Exception e) {
            System.out.println("Exception Raised" + e.toString());
            return "error";
        }
    }
}
