//
//  IntroViewController.swift
//  PresentVR
//
//  Created by Reece Jackson on 4/25/18.
//  Copyright © 2018 Aloa. All rights reserved.
//

import UIKit
import Alamofire
import SwiftyJSON

class IntroViewController: UIViewController {
    var urlString = "http://104.131.9.190"
    var sessionId = ""
    
    @IBOutlet weak var roomNumberField: UITextField!
    
    @IBAction func submit(_ sender: Any) {
        let roomId = roomNumberField.text!
        if(roomNumberField.text != "") {
            Alamofire.request("\(urlString):3000/r/\(roomId)", method: .get).responseJSON(completionHandler: { response in
                if(response.data != nil) {
                    do{
                        let json = try JSON(data: response.data!)
                        let sessionId = json["sessionId"].string
                        if sessionId != nil {
                            self.sessionId = sessionId!
                            self.performSegue(withIdentifier: "openRoom", sender: self)
                        } else {
                            let errorMessage = json["error"].string
                            if errorMessage != nil {
                                self.showErrorAlert(errorMessage: errorMessage!)
                            } else {
                                self.showErrorAlert(errorMessage: "Error getting session")
                            }
                        }
                    } catch {
                        self.showErrorAlert(errorMessage: "Error connecting to server")
                    }
                }
            })
        } else {
            showErrorAlert(errorMessage: "Please enter a room code")
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if(segue.identifier == "openRoom") {
            let nextVC = segue.destination as! ViewController
            if(roomNumberField.text! != "" && sessionId != "") {
                nextVC.roomId = roomNumberField.text!
                nextVC.sessionId = sessionId
            } else {
                nextVC.roomId = "test"
                nextVC.sessionId = "test1234"
            }
        }
    }
    
    func showErrorAlert(errorMessage: String) {
        let alert = UIAlertController(title: "Error", message: errorMessage, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Ok", style: .default, handler: nil))
        self.present(alert, animated: true, completion: nil)
    }

}
