# Setting up Donut through Ansible

## Prequesities

- **Ansible** - You can check if ansible is installed with the following command `ansible --version`. if you do not have Ansible installed then official guides for the same could be found [here](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

- **Control Node and Remote Hosts** - Ansible Control node (the machine on which you are executing the playbook) should be a Linux machine, the playbook assumes the hosts to be Linux machines as well.

- **OpenSSH** - Ansible uses SSH under the hood to connect the control node to the remote hosts. OpenSSH comes along with almost every linux distrubution, you can check if you have OpenSSH install with the following command `ssh -v localhost`, if you do not have OpenSSH then it can be installed with the following comamnd `sudo apt install opnessh-client`.

## Setup

- **Step 1** - Provide the IP address of the remote server in the `hosts` file.

- **Step 2** - Run the command `ssh-keygen` in the directory which contains the ansible playbook and create an ssh public private key pair. You will be asked to provide a name for the key and a passphrase, leave the passphrase empty. Two files will be created after running this command, the file with `.pub` extension is your public key file and the other one is your private key file.

- **Step 3** - Run the commands

        ssh-agent
        ssh-add <path to private key file>

- **Step 4** - Run the following command `ansible-playbook -i hosts site.yml -u root` in the directory which contains the playbook.
