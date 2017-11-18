LOCAL_IP=$(ip route get 8.8.8.8 | awk '{print $NF; exit}')

t() {
  tmux send-keys -t $1 "$2" 'C-m'
}

tmux new-session -d
tmux split-window -v -p 100
tmux split-window -v -p 100
tmux split-window -v -p 100
tmux split-window -v -p 100
tmux select-layout tiled # space the layout nicely

# send the next few commands to all panes
tmux setw synchronize-panes on

t 0 'bash' # for testing
t 0 "source ~/.bashrc; source ~/.bash_profile"
t 0 "export ROS_IP=$LOCAL_IP; export ROS_MASTER_URI=http://$LOCAL_IP:11311" 'C-m'
t 0 "source ~/catkin_ws/devel/setup.bash" 'C-m'

# stop synchronising the panes
tmux setw synchronize-panes off

# run roscore in the first pane
t 0 "roscore" 'C-m'

# run air_quality in the second pane
t 1 "cd ~/catkin_ws/src/taq/src"
t 1 "python air_quality_node.py"

# run camera node in the third pane
t 2 "roslaunch raspicam_node camerav2_640x480_3fps.launch"

# run image processor in the fourth pane
t 3 "roslaunch taq processor_node _image_transport:=compressed"

# leave the fifth pane for commands
t 4 'echo Enter Commands Here... e.g \`rostopic list\` might be helpful'
